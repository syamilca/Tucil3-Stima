mapboxgl.accessToken = 'pk.eyJ1Ijoic3BlY2lhbG9uZTE2IiwiYSI6ImNramN0enVlZzJjMDYycXA5bXJ1OXE2bTcifQ.aTWG4bxIEgemZu-9xJ9i6w'
let dept = ""
let dest = ""
let myGraf = new Graph()
let directionAddedFlag = false
let myMap

function bacaTxt(result){
    let temp = []
    temp.push.apply(temp,result.split('\n'));
    if(!isNaN(temp[0]) && temp.length == (2*Number(temp[0]))+1){
        let nNode = Number(temp[0])
        
        let i
        for(i=1; i<=nNode; i++){
            let nodeTemp = temp[i].split(" ")
            myGraf.addNode(String(nodeTemp[2]),nodeTemp[0],nodeTemp[1])
        }
        for(i=1+nNode;i<=2*nNode;i++){
            const t = temp[i].split(' ')
            if(t.length!=nNode) throw "matriks ketetanggaan harus matriks persegi"
            let counter = 0
            t.forEach((isFriend)=>{
                if(isNaN(isFriend) || !(Number(isFriend)<=1 && Number(isFriend)>=0)){
                    throw "matriks should be in number 1 and 0 only"
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
        throw "error. cek format testcase sesuai dengan readme!"
    }
    console.log(myGraf)
}

function klik(){
    if(dept===dest){
        console.log("error, depature harus != destination")
    }else{
        try{
            const grafduplikat = myGraf
            haha = a_star(grafduplikat,dept,dest)
            setDirectionOnMap(haha.rute,dept,dest)
            console.log(haha)
            document.getElementById("output").innerHTML = haha.rute+"<br>"+haha.heuristik+"<br>jarak = "+haha.jarak
        }catch(err){
            document.getElementById("output").textContent = err
            console.log(err)
        }
    }
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
            myMap.addSource(n, {
                'type' : 'geojson',
                'data' : dataKoordinat
            })

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

            myMap.addLayer({
                "id": "jarak2titik-"+counter,
                "type": "symbol",
                "source": n,
                "layout": {
                  "symbol-placement": "line-center",
                  "text-font": ["Open Sans Regular"],
                  "text-field": '{title}',
                  "text-size": 13,
                  "text-rotate": -4,
                  "symbol-spacing": 1,
                },
                "paint":{
                  "text-translate":[0,-40],
                }
              })
            counter++
        })

        myMap.addSource('directions',{
            'type' : 'geojson',
            'data' : {
                'type' : 'Feature',
                'geometry' :{
                    'type' :'LineString', 
                    'coordinates' : []
                } ,
                
            }
        })

        myMap.addLayer({
            'id': 'directions',
            'source': 'directions',
            'type': 'line',
            'paint': {
                'line-width': 4,
                'line-color': '#f013b1'
            }
        })

        myMap.addSource('places', {
            'type': 'geojson',
            'data': lokasi
            });

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
        }
    }

    listOfPassedNodes.forEach((node)=>{
        dir.geometry.coordinates.push(
            [myGraf.getNodebyValue(node).long,myGraf.getNodebyValue(node).lat]
        )
    })
    myMap.getSource('directions').setData(dir)
}

document.getElementById("depatureNode").addEventListener("change",function(){
    document.getElementById("destinationNode").innerHTML = ""
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
    }
},false)

document.getElementById("destinationNode").addEventListener("change",function(){ 
    if(this.value!='0'){
        dest = String(this.value).replace('\n','').trim()
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
 * @param {Graph} graf 
 * @param {string} start 
 * @param {string} destination 
 */
 function a_star(graf,start,destination){
    let distanceResult = 0
    let route = [start]
    let bannedNode = []
    let isSuccess = false
    let isFail  = false
    let heuristik = graf.getHeuristicArray(destination)
    //CHECK START AND DESTINATION ARE ON GRAF
    if(!graf.isExist(start)||!graf.isExist(destination)) throw "node tujuan/awalan tidak pernah ada disistem!"
    //DOIN A_STAR
    while(!isSuccess && !isFail){
        let tempNode = graf.getNodebyValue(start)
        let flag = true
        while(flag){
            //CEK TETANGGA DAN HAPUS TETANGGA YANG SUDAH ADA PADA ROUTE or BANNED NODE
            route.forEach((r)=>{tempNode.deleteFriend(r)})
            bannedNode.forEach((r)=>{tempNode.deleteFriend(r)})

            //CEK APAKAH ADA TETANGGA MINIMAL 1
            if(tempNode.friends.length>0)
            //JIKA ADA CARI TERPENDEK
            {
                let tNode2 = graf.getNodebyValue(tempNode.friends[0].value)
                let tJarak =  tempNode.friends[0].jarak + heuristik[graf.searchNode(tempNode.friends[0].value)]
                for(let x = 1; x<tempNode.friends.length;x++){
                    if(tempNode.friends[x].value==destination){
                        tJarak = tempNode.friends[x].jarak + heuristik[graf.searchNode(tempNode.friends[x].value)]
                        tNode2 = graf.getNodebyValue(tempNode.friends[x].value)
                        break
                    }else if(tempNode.friends[x].jarak + heuristik[graf.searchNode(tempNode.friends[x].value)] < tJarak){
                        tJarak = tempNode.friends[x].jarak + heuristik[graf.searchNode(tempNode.friends[x].value)]
                        tNode2 = graf.getNodebyValue(tempNode.friends[x].value)
                    }
                }
                distanceResult = distanceResult + tJarak
                console.log(distanceResult)
                route.push(tNode2.value)
                if(tNode2.value===destination){
                    isSuccess=true
                    flag = false
                }else{
                    tempNode = tNode2
                }

            }else
            //JIKA TIDAK ADA 
            {
                flag = false
                if(route.length<=1){
                    isFail = true
                }else{
                    bannedNode.push(tempNode.value)
                    tempNode = graf.getNodebyValue(route[route.length-2])
                    distanceResult = distanceResult - graf.getNodebyValue(route[route.length-2]).getWeight(route[route.length-1])
                    route = deleteArray(route,route[route.length-1])
                }
            }
        }
    }

    if(isSuccess){
        return {
            'rute' : route,
            'jarak' : distanceResult,
            'heuristik' : heuristik
        }
    }else{
        throw "gagal melakukan A*, coba cek graf anda sekali lagi  :)"
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

