export const TripList = {
  noNamespaceSchemaLocation:"http://xmlopen.rejseplanen.dk/xml/rest/hafasRestTrip.xsd",
  Trip:[{
    Leg:[{
      name:"IC 68629",
      type:"IC",
      Origin:{
        name:"København H",
        type:"ST",
        routeIdx:"0",
        time:"07:02",
        date:"19.07.16",
        track:"6"
        },
      Destination:{
        name:"Fredericia St.",
        type:"ST",
        routeIdx:"26",
        time:"09:36",
        date:"19.07.16",
        track:"5"
        },
      Notes:{
        text:"Retning: Esbjerg St.;Toget har lav indstigning,Reservering anbefales,Mulighed for internet,Cykelreservering kræves"
        },
      JourneyDetailRef:{
        ref:"http://xmlopen.rejseplanen.dk/bin/rest.exe/journeyDetail?ref=756777%2F260714%2F171314%2F166602%2F86%3Fdate%3D19.07.16%26station_evaId%3D8600626%26format%3Djson%26"
        }
      },{
      name:"Re 3329",
      type:"REG",
      Origin:{
        name:"Fredericia St.",
        type:"ST",
        routeIdx:"10",
        time:"09:51",
        date:"19.07.16",
        track:"3"
        },
      Destination:{
        name:"Aarhus H",
        type:"ST",
        routeIdx:"19",
        time:"11:01",
        date:"19.07.16"
        },
      Notes:{
        text:"Retning: Aarhus H;Toget har lav indstigning,Mulighed for internet"
        },
      JourneyDetailRef:{
        ref:"http://xmlopen.rejseplanen.dk/bin/rest.exe/journeyDetail?ref=709968%2F265011%2F744942%2F135815%2F86%3Fdate%3D19.07.16%26station_evaId%3D8600079%26format%3Djson%26"
        }
      }]
    },{
    Leg:{
      name:"ICL 51029",
      type:"LYN",
      Origin:{
        name:"København H",
        type:"ST",
        routeIdx:"0",
        time:"07:25",
        date:"19.07.16",
        track:"5"
        },
      Destination:{
        name:"Aarhus H",
        type:"ST",
        routeIdx:"35",
        time:"10:43",
        date:"19.07.16",
        track:"4"
        },
      Notes:{
        text:"Retning: Sønderborg St., Struer St. og Frederikshavn St.;Mulighed for internet,Cykelreservering kræves"
        },
      JourneyDetailRef:{
        ref:"http://xmlopen.rejseplanen.dk/bin/rest.exe/journeyDetail?ref=871023%2F299457%2F557506%2F11588%2F86%3Fdate%3D19.07.16%26station_evaId%3D8600626%26format%3Djson%26"
        }
      }
    },{
    Leg:{
      name:"ICL 51041",
      type:"LYN",
      Origin:{
        name:"København H",
        type:"ST",
        routeIdx:"0",
        time:"08:25",
        date:"19.07.16",
        track:"7"
        },
      Destination:{
        name:"Aarhus H",
        type:"ST",
        routeIdx:"35",
        time:"11:43",
        date:"19.07.16",
        track:"2"
        },
      Notes:{
        text:"Retning: Frederikshavn St.;Mulighed for internet,Cykelreservering kræves"
        },
      JourneyDetailRef:{
        ref:"http://xmlopen.rejseplanen.dk/bin/rest.exe/journeyDetail?ref=291690%2F106355%2F59104%2F67679%2F86%3Fdate%3D19.07.16%26station_evaId%3D8600626%26format%3Djson%26"
        }
      }
    }]
  }