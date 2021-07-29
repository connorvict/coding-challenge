require('dotenv').config()
const fetch = require("node-fetch");

const getDatasetId = async () => {
    const res = await fetch(process.env.API_BASE + `/api/datasetId`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*'
        }
    })

    const data  = await res.json()
    return data.datasetId
}

const getVehicles = async (datasetId) => {
    const res = await fetch(process.env.API_BASE + `/api/${datasetId}/vehicles`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*'
        }
    })

    const data  = await res.json()
    return data
}

const getVehicleInfo = async (datasetId, vehicleId) => {
    const res = await fetch(process.env.API_BASE + `/api/${datasetId}/vehicles/${vehicleId}`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*'
        }
    })

    const data  = await res.json()
    return data
}

const getDealerInfo = async (datasetId, dealerId) => {
    const res = await fetch(process.env.API_BASE + `/api/${datasetId}/dealers/${dealerId}`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*'
        }
    })

    const data  = await res.json()
    return data
}

const postAnswer = async (datasetId) => {
    let content = {
        'dealers': dealers
    }

    const res = await fetch(process.env.API_BASE + `/api/${datasetId}/answer`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*'
        },
        body: JSON.stringify(content)
    })

    const data  = await res.json()
    console.log(data)
}

// Arrays to store information before generating the json
let vehicles = []
let dealers = []
//Set to check if dealerId already exists
let dealerIds = new Set([])

const main = async () => {
    // Get datasetId and vehicleList 
    console.log("Getting Dataset Id...")
    const datasetId = await getDatasetId()
    console.log("Getting Vehicle List...")
    const vehicleList = await getVehicles(datasetId)

    // For all the vehicles, get vehicle and dealer information
    for (var i in vehicleList.vehicleIds) {
        console.log("Attempting api call: " + (i*1+1))
        try {
            const vehicleInfo = await getVehicleInfo(datasetId, vehicleList.vehicleIds[i])
            // Store value
            vehicles.push(vehicleInfo)
    
            // If dealer doesn't already exist
            if (!dealerIds.has(vehicleInfo.dealerId)) {
                const dealerInfo = await getDealerInfo(datasetId, vehicleInfo.dealerId)
                dealerInfo.vehicles = []
                // Store value
                dealers.push(dealerInfo)
                // Add dealer to set for checking
                dealerIds.add(dealerInfo.dealerId)
            }
            console.log('Success')
        } catch (error) {
            console.log(error)
        }
        
    }
    // Go through all dealers and vehicles and add the appropriate vehicle to the dealer.
    for(var i in dealers){
        for(var j in vehicles){
            if(vehicles[j].dealerId === dealers[i].dealerId){
                // Construct json without dealer information in vehicle
                const json = {
                    'vehicleId': vehicles[j].vehicleId,
                    'year': vehicles[j].year,
                    'make': vehicles[j].make,
                    'model': vehicles[j].model
                }
                // Add vehicle to dealer's array
                dealers[i].vehicles.push(json)
            }
        }
    }
    // POST answer and print results
    console.log("----------Results----------")
    postAnswer(datasetId) 
}

main()