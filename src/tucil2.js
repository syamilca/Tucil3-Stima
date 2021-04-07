mapboxgl.accessToken = 'pk.eyJ1IjoiaGFmaWRhYmkiLCJhIjoiY2tuNXZ2N25uMDg1MjJyczlna3VndmFmNSJ9.VKoc34AfkqZ5uUUODIUBVA'
let dept = ""
let dest = ""
let myGraf
let directionAddedFlag = false
let myMap

function bacaTxt(result){
    let temp = []
    temp.push.apply(temp,result.split('\n'));
    if(!isNaN(temp[0]) && temp.length == (2*Number(temp[0]))+1){
        myGraf = new Graph()
        let nNode = Number(temp[0])
        
        let i
        for(i=1; i<=nNode; i++){
            let nodeTemp = temp[i].split(" ")
            myGraf.addNode(String(nodeTemp[2]),nodeTemp[0],nodeTemp[1])
        }
        for(i=1+nNode;i<=2*nNode;i++){
            const t = temp[i].split(' ')
            if(t.length!=nNode) throw "Matriks ketetanggaan harus matriks persegi"
            let counter = 0
            t.forEach((isFriend)=>{
                if(isNaN(isFriend) || !(Number(isFriend)<=1 && Number(isFriend)>=0)){
                    throw "Matriks hanya bisa 0 atau 1 saja"
                }
                if(Number(isFriend)==1){
                    myGraf.addFriend(myGraf.getNodebyIndex(i-1-nNode).value, myGraf.getNodebyIndex(counter).value)
                }
                counter++
            })
        }
        setComboBox()
        muatPeta2()
        //document.getElementById("output").textContent = "ACC"
    }else{
        throw "Error. Cek format testcase sesuai dengan readme!"
    }
    console.log(myGraf)
}

function klik(){
    if(dept===dest || dept==="0" || dest==="0"){
        document.getElementById("output").textContent = "tidak boleh dept==dest !"
    }else{
        try{
            haha = a_star(dept,dest)
            setDirectionOnMap(haha.rute,dept,dest)
            document.getElementById("output").innerHTML = haha.rute+"<br>jarak = "+haha.totalJarak
            let tampilKeun = '<strong>total distance = '+haha.totalJarak.toFixed(2)+' m</strong><ol class="list-group list-group-numbered">'
            const warna = ["list-group-item-primary","list-group-item-danger","list-group-item-warning","list-group-item-success"]
            let jartem = 0
            for(let x =0; x<haha.rute.length;x++){
                let jarak = 0
                if(x>0){
                    let node1 = myGraf.getNodebyValue(haha.rute[x])
                    let node2 = myGraf.getNodebyValue(haha.rute[x-1])
                    jarak = myGraf.getHaversine({lat:node1.lat,long:node1.long},{lat:node2.lat,long:node2.long})
                    jartem = jartem+jarak
                }
                let tmp = '<li href="#" class="list-group-item ' + warna[x%4] + '">'+ '<div class="ms-2 me-auto"><div class="fw-bold"><strong>'+ (x+1)+'. '+haha.rute[x] +'</strong></div>'
                if(x!=haha.rute.length-1){
                    tmp = tmp + tampilinDetail(haha.rute[x],jartem,haha.rute[x+1]) +'</div>' +'</li>'
                }else{
                    tmp = tmp +'</div>' +'</li>'
                }
                tampilKeun = tampilKeun + tmp
            }

            document.getElementById("output").innerHTML = tampilKeun+"</ol>"
            return true
        }catch(err){
            document.getElementById("output").textContent = err
        }
    }
    return false
}

/**
 * 
 * @param {String} poin 
 * @param {Number} prevdist
 */
function tampilinDetail(poin,prevdist,selected){
    let res = ""
    let heu = myGraf.getHeuristicArray(dest)
    let n = myGraf.getNodebyValue(poin)
    for(let i =0 ; i<n.friends.length ; i++){
        const temen = n.friends[i]
        if(temen.value==selected){
            res = res + "<u>" + temen.value + " => " + prevdist.toFixed(2) + " + " + temen.jarak.toFixed(2) + " + " + heu[temen.value].toFixed(2) + " = " + (temen.jarak+prevdist+heu[temen.value]).toFixed(2) + "</u><br>" 
        }else{
            res = res + temen.value + " => " + prevdist.toFixed(2) + " + " + temen.jarak.toFixed(2) + " + " + heu[temen.value].toFixed(2) + " = " + (temen.jarak+prevdist+heu[temen.value]).toFixed(2) + "<br>" 
        }
    }
    return res
}

function muatPeta2(){
    myMap = new mapboxgl.Map(
        {
            container : 'googleMap',
            style: 'mapbox://styles/mapbox/streets-v9', // style URL
            center: [Number(myGraf.nodes[0].long),Number(myGraf.nodes[0].lat)], // starting position as [lng, lat]
            zoom: 14
        }
    )

    let lokasi = {
        'type' : 'FeatureCollection',
        'features' : []
    }
    for(let i =0; i<myGraf.nodes.length;i++){
        const myNode = myGraf.getNodebyIndex(i)
        lokasi.features.push(
            {
                'type': 'Feature',
                'properties': {
                'description': myNode.value,
                },
                'geometry': {
                'type': 'Point',
                'coordinates': [myNode.long, myNode.lat]
                }
            }
        )
    }

    myMap.on('load',function(){
        const mapLine = myGraf.getLineOneAnother()
        let counter = 1
        mapLine.forEach((dataKoordinat) => {
            const n = 'garis'+counter

            //SOURCE UNTUK LINE ANTAR DUA TITIK
            myMap.addSource(n, {
                'type' : 'geojson',
                'data' : dataKoordinat
            })

            //LAYER UNTUK LINE ANTAR DUA TITIK
            myMap.addLayer({
                'id': n,
                'type': 'line',
                'source': n,
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round',
                },
                'paint': {
                    'line-color': '#888',
                    'line-width': 3
                }
            })
            counter++
        })

        //SOURCE UNTUK RUTE DARI TITIK A KE TITIK B
        myMap.addSource('directions',{
            'type' : 'geojson',
            'data' : {
                'type' : 'Feature',
                'geometry' :{
                    'type' :'LineString', 
                    'coordinates' : []
                } ,
                
            }})
        //LAYER UNTUK RUTE DARI TITIK A KE TITIK B
        myMap.addLayer({
            'id': 'directions',
            'source': 'directions',
            'type': 'line',
            'paint': {
                'line-width': 4,
                'line-color': '#1ce83e'
            }
        })

        //SOURCE UNTUK POINT LOKASI
        myMap.addSource('places', {
            'type': 'geojson',
            'data': lokasi
            });
        
        //LAYER UNTUK POINT LOKASI
        myMap.addLayer({
            'id': 'poi-labels',
            'type': 'symbol',
            'source': 'places',
            'layout': {
                'text-field': ['get', 'description'],
                'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
                'text-radial-offset': 0.5,
                'text-justify': 'auto',
                'icon-image': ['concat', ['get', 'icon'], '-15']
            },
            'paint' : {
                'text-color' : '#556fe0'
            }
        });

        //LAYER UNTUK ANIMASI
        myMap.addSource('animasi',{
            'type' : 'geojson',
            'data' : {
                'type': 'FeatureCollection',
                'features': [
                    {
                        'type': 'Feature',
                        'properties': {},
                        'geometry': {
                            'type': 'Point',
                            'coordinates': []
                        }
                    }
                ]                
            }
        })
        myMap.addLayer({
            'id' : 'animasi',
            'source' : 'animasi',
            'type' : 'symbol',
            'layout': {
                'icon-image': 'airport-15',
                'icon-rotate': ['get', 'bearing'],
                'icon-rotation-alignment': 'map',
                'icon-allow-overlap': true,
                'icon-ignore-placement': true
            }
        })

        //LAYER UNTUK JARAK ANTAR DUA TITIK
        counter = 1
        mapLine.forEach((dataKoordinat)=>{
            const n = 'garis'+counter
            //LAYER UNTUK JARAK ANTAR DUA TITIK
            myMap.addLayer({
                "id": "jarak2titik-"+counter,
                "type": "symbol",
                "source": n,
                "layout": {
                  "symbol-placement": "line-center",
                  "text-font": ["Open Sans Regular"],
                  "text-field": '{title}',
                  "text-size": 14,
                  "text-rotate": -3,
                  "symbol-spacing": 1,
                },
                "paint":{
                  "text-translate":[0,-30],
                }
              })
            counter++
        })

        let steps = 300
        let dataAnimasi
        let dataRute
        let arc = []
        let linedist = 0
        document.getElementById("tombolEksekusi").addEventListener('click',()=>{
            if(klik()){
                dataAnimasi = myMap.getSource('animasi')._data
                dataRute = myMap.getSource('directions')._data
                console.log(dataRute)
                counter = 0
                arc = []
                let start = {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "Point",
                        "coordinates": dataRute.geometry.coordinates[0]
                    }
                }
                let finish = {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "Point",
                        "coordinates": dataRute.geometry.coordinates[dataRute.geometry.coordinates.length-1]
                    }
                }
                var sliced = turf.lineSlice(start, finish, dataRute)
                linedist = turf.lineDistance(sliced,'kilometers')
                dataRute = sliced
                animate()
            }else{
                myMap.getSource('directions').setData({
                    'type' : 'Feature',
                    'geometry' :{
                        'type' :'LineString', 
                        'coordinates' : []
                    } ,
                    
                })
                myMap.getSource('animasi').setData({
                    'type': 'FeatureCollection',
                    'features': [
                        {
                            'type': 'Feature',
                            'properties': {},
                            'geometry': {
                                'type': 'Point',
                                'coordinates': []
                            }
                        }
                    ]                
                })
            }
        })

        function animate(){
            for(let y=0; y < linedist ; y = y+(linedist/steps)){
                //console.log(y)
                let segment = turf.along(dataRute,y)
                arc.push(segment.geometry.coordinates)
            }
            dataRute.geometry.coordinates = arc
            let start =  dataRute.geometry.coordinates[counter >= steps ? counter-1 : counter]
            let end = dataRute.geometry.coordinates[counter >= steps ? counter : counter+1]
            console.log(start)
            console.log(end)
            if(!start||!end) return;
            dataAnimasi.features[0].geometry.coordinates = dataRute.geometry.coordinates[counter]
            dataAnimasi.features[0].properties.bearing = turf.bearing(turf.point(start), turf.point(end))

            myMap.getSource('animasi').setData(dataAnimasi)

            if(counter<steps){
                requestAnimationFrame(animate)
            }
            console.log(counter)
            counter++
        }
    })
}

function setComboBox(){
    let depature = '<option value="0">Select Depature Point</option>'
    let i
    for(i=0;i<myGraf.nodes.length;i++){
        depature = depature + '<option value="'+myGraf.nodes[i].value+'">'+ myGraf.nodes[i].value +'</option>'
    }
    document.getElementById("depatureNode").innerHTML = depature
}

function setDirectionOnMap(listOfPassedNodes, start, end){
    let dir = {
        'type' : 'Feature',
        'geometry' :{
            'type' :'LineString', 
            'coordinates' : []
        } ,
        
    }

    let initAnimasi = {
        'type': 'FeatureCollection',
        'features': [
            {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'Point',
                    'coordinates': []
                }
            }
        ]                
    }
    const st_point = myGraf.getNodebyValue(start)
    const end_point = myGraf.getNodebyValue(end)
    initAnimasi.features[0].geometry.coordinates.push(st_point.long)
    initAnimasi.features[0].geometry.coordinates.push(st_point.lat)
    listOfPassedNodes.forEach((node)=>{
        dir.geometry.coordinates.push([myGraf.getNodebyValue(node).long,myGraf.getNodebyValue(node).lat])
    })
    myMap.getSource('directions').setData(dir)
    myMap.getSource('animasi').setData(initAnimasi)
}

document.getElementById("depatureNode").addEventListener("change",function(){
    document.getElementById("destinationNode").innerHTML = ""
    dept = ""
    dest = ""
    if(this.value!='0'){
        dept = String(this.value).replace('\n','').trim()
        dest = ""
        let destination = '<option value="0">Select Destination</option>'
        for(let i=0;i<myGraf.nodes.length;i++){
            if(dept!=(myGraf.nodes[i].value.trim())!=0){
                destination = destination + '<option value="'+myGraf.nodes[i].value+'">'+myGraf.nodes[i].value+'</option>'
            }
        }
        document.getElementById("destinationNode").innerHTML = destination
        document.getElementById("daftarHeuristik").innerHTML = ""
        document.getElementById("tujuanSaya").textContent = "-"
    }
},false)

document.getElementById("destinationNode").addEventListener("change",function(){
    dest = "" 
    if(this.value!='0'){
        dest = String(this.value).replace('\n','').trim()
        let tmp = ""
        const heuristikObj = myGraf.getHeuristicArray(dest)
        const listPoint = Object.keys(heuristikObj)
        listPoint.forEach((poin)=>{
            tmp = tmp + "<tr>" + "<td>" + poin+ "</td>" + "<td>" + heuristikObj[poin].toFixed(2) + "</td>" + "</tr>"
        })
        document.getElementById("daftarHeuristik").innerHTML = tmp
        document.getElementById("tujuanSaya").textContent = dest
    }
},false)

document.getElementById('inputfile').addEventListener('change', function() 
    {
        const fr=new FileReader();
        dept = ""
        dest = ""
        fr.onload=  () => {
            try{
                bacaTxt(fr.result)
            }catch(err){
                document.getElementById("output").textContent = err
            }
        };
        fr.readAsText(this.files[0]);
        
})

/**
 * 
 * @param {string} start 
 * @param {string} destination 
 */
 function a_star(start,destination){
    let heuristik = myGraf.getHeuristicArray(destination)
    if((myGraf.isExist(start)&&myGraf.isExist(destination))==false) throw "titik start/destination tidak terdefinisi"
    let rute = [start]
    let banned = []
    let fail = false

    let c = 0
    while(!fail && !rute.includes(destination)){
        let temp = a_star_helper1(rute,banned,rute[rute.length-1],heuristik)
        rute = temp.rute
        banned = temp.banned
        if(rute.length==0){
            fail = true
        }

        //PENGAMAN DARI INFINITIE LOOPING
        c++
        if(c>myGraf.numOfNodes*2){fail=true}
    }

    if(fail) throw "tidak dapat dilakukan A*"
    else return{
        'start' : start,
        'destination' : destination,
        'rute' :   rute,
        'totalJarak' : sumJarak(rute)
    }

}

/**
 * 
 * @param {Array} rute 
 * @param {Array} banned 
 * @param {string} currNode
 */
function a_star_helper1(rute, banned,currNode, heuristik){
    let cnode = myGraf.getNodebyValue(currNode)
    let candidates = []
    cnode.friends.forEach((f)=>{
        if(!(rute.includes(f.value) || banned.includes(f.value))){
            candidates.push(f)
        }
    })
    if(candidates.length>0){
        let nextNode = candidates[0]
        for(let x=1;x<candidates.length;x++){
            let cName = candidates[x].value
            let cJarak = candidates[x].jarak
            //console.log([cJarak+heuristik[cName]])
            //console.log(nextNode.jarak + heuristik[nextNode.value])
            if(cJarak + heuristik[cName] < nextNode.jarak + heuristik[nextNode.value]){
                //console.log([cJarak,heuristik[cName]])
                nextNode = candidates[x]
            }
        }
        //console.log(candidates)
        //console.log(nextNode)
        rute.push(nextNode.value)
        //console.log(rute)
        return {
            'rute' : rute,
            'banned' : banned
        }
    }else{
        rute = deleteArray(rute,rute[rute.length-1])
        banned.push(currNode)
        return{
            'rute' : rute,
            'banned' : banned
        }
    }
}

/**
 * 
 * @param {Array} oldArray 
 * @param {*} key 
 */
function deleteArray(oldArray, key){
    let newArray = []
    oldArray.forEach((i)=>{
        if(i!=key){
            newArray.push(i)
        }
    })
    return newArray
}

/**
 * 
 * @param {Array} rute 
 */
function sumJarak(rute){
    let s = 0
    for(let x=1;x<rute.length;x++){
        let pa = myGraf.getNodebyValue(rute[x])
        let pb = myGraf.getNodebyValue(rute[x-1])
        s = s + myGraf.getHaversine({lat:pa.lat , long :pa.long},{lat: pb.lat, long :pb.long})
    }
    return s
}
