import React,{useState, useEffect} from "react";
import {  Platform,StyleSheet, Text, View,Image } from "react-native";
import MapView,{Marker} from "react-native-maps";
import mapStyle from "./json/mapstyle.json";
import Constants from "expo-constants";
import * as Location from "expo-location";
import { Icon } from "react-native-elements";
import axios from "axios";
import metroJson from "./json/metro.json";
import { VictoryPie } from "victory-native";
const UBIKE_URL =
"https://data.ntpc.gov.tw/api/datasets/71CD1490-A2DF-4198-BEF1-318479775E8A/json/preview";

const dataColor = ["#FF2D2D", "#02C874"];

const App =({navigation})=>{
    const [region, setRegion] = useState({
        longitude: 121.543054,
        latitude: 25.044747,
        longitudeDelta: 0.01,
        latitudeDelta: 0.02,
      });
      const [marker, setMarker] = useState({
        coord: {
          longitude: 121.544637,
          latitude: 25.024624,
        },
        name: "國立臺北教育大學",
        address: "台北市和平東路二段134號",
      });
      const [onCurrentLocation, setOnCurrentLocation] = useState(false);
      const [metro, setMetro] = useState(metroJson);
      const [ubike, setUbike] = useState([]);
      const onRegionChangeComplete = (rgn) => {
        if (
          Math.abs(rgn.latitude - region.latitude) > 0.0010 ||
          Math.abs(rgn.longitude - region.longitude) > 0.0010
        ) {
          setRegion(rgn);
          setOnCurrentLocation(false);
        }
      };
      const getUbikeAsync = async () => {
        let response = await axios.get(UBIKE_URL);
        setUbike(response.data);
      };
      const setRegionAndMarker = (location) => {
        setRegion({
          ...region,
          longitude: location.coords.longitude,
          latitude: location.coords.latitude,
        });
        setMarker({
          ...marker,
          coord: {
            longitude: location.coords.longitude,
            latitude: location.coords.latitude,
          },
        });
      };
    
      const getLocation = async () => {
        let { status } = await Location.requestPermissionsAsync();
        if (status !== "granted") {
          setMsg("Permission to access location was denied");
          return;
        }
        let location = await Location.getCurrentPositionAsync({});
        setRegionAndMarker(location);
        setOnCurrentLocation(true);
      };
    
      useEffect(() => {
        if (Platform.OS === "android" && !Constants.isDevice) {
          setErrorMsg(
            "Oops, this will not work on Sketch in an Android emulator. Try it on your device!"
          );
        } else {
          getLocation();
          getUbikeAsync();
        }
      }, []);
   
    return(
        <View style={{ flex: 1 }}>
       <MapView
        region={region}
        style={{flex:1}}
        showsTraffic
        provider="google"
        
        onRegionChangeComplete={onRegionChangeComplete}
        customMapStyle={mapStyle}
      >
        {metro.map((site) => (
          <Marker
            coordinate={{ latitude: site.latitude, longitude: site.longitude }}
            key={`${site.id}${site.line}`}
            title={site.name}
            description={site.address}
          >
            <Image
              source={require("./img/subway.png")}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          </Marker>
        ))}
        {ubike.map((site) => (
          <Marker
            coordinate={{
              latitude: Number(site.lat),
              longitude: Number(site.lng),
            }}
            key={site.sno}
            title={`${site.sna} ${site.sbi}/${site.tot}`}
            description={site.ar}
          >
                
             <VictoryPie
            radius={17}
            data={[
              {x:site.tot-site.sbi,y:100-(site.sbi/site.tot)*100},
              //全部減借走就是剩的車子   圓餅100%-減被借走車輛所佔的百分比
              {x:site.sbi,y:(site.sbi/site.tot)*100},
              //被借走的
            ]}
            colorScale={dataColor}
            innerRadius={7}
            labelRadius={10}
            />
          </Marker>
        ))}
        <Marker
          coordinate={marker.coord}
          title={marker.name}
          description={marker.address}
        >
          <Image source={require('./img/marker.png')}
                  style={StyleSheet.stay}/>
        </Marker>
      </MapView>
      {!onCurrentLocation && (
        <Icon
          raised
          name="ios-locate"
          type="ionicon"
          color="black"
          containerStyle={{
            backgroundColor: "#517fa4",
            position: "absolute",
            right: 20,
            top:700,
        
          }}
          onPress={getLocation}
        />
      )}
      </View>
    )
};
const styles = StyleSheet.create({
    stay:{
      width:5,
      height:5
    }
  });
  
  export default  App;