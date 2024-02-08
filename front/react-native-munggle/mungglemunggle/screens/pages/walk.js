import React, { useEffect, useRef, useState } from "react";
import { View, Text, Button, ScrollView, StyleSheet, Dimensions, TouchableOpacity, Alert } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { KAKAOMAP_API_KEY } from '@env';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")

const apiKey = KAKAOMAP_API_KEY

const htmlContainer = `
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      .dot {overflow:hidden;float:left;width:12px;height:12px;background: url('https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/mini_circle.png');}    
      .dotOverlay {position:relative;bottom:10px;border-radius:6px;border: 1px solid #ccc;border-bottom:2px solid #ddd;float:left;font-size:12px;padding:5px;background:#fff;}
      .dotOverlay:nth-of-type(n) {border:0; box-shadow:0px 1px 2px #888;}    
      .number {font-weight:bold;color:#ee6152;}
      .dotOverlay:after {content:'';position:absolute;margin-left:-6px;left:50%;bottom:-8px;width:11px;height:8px;background:url('https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/vertex_white_small.png')}
      .distanceInfo {position:relative;top:5px;left:5px;list-style:none;margin:0;}
      .distanceInfo .label {display:inline-block;width:50px;}
      .distanceInfo:after {content:none;}
      
      #map {
        width: 397px;
        height: 682px;
      }
      #startButton {
        width: 100px;
        height: 100px;
        background-color: rgb(253, 245, 169);
        border: none;
        border-radius: 100%;
        z-index: 5;
        position: absolute;
        bottom: 8%;
        left: 38%;
        display: block;
      }
      #startText {
        display: flex;
        align-items: center;
        text-align: center;
        justify-content: center;
        font-size: 20px;
      }
      #stopButton {
        width: 100px;
        height: 100px;
        background-color: rgb(255, 230, 0);
        border: none;
        border-radius: 100%;
        z-index: 5;
        position: absolute;
        bottom: 8%;
        left: 38%;
        display: none;
      }
      #stopText {
        display: flex;
        align-items: center;
        text-align: center;
        justify-content: center;
        font-size: 20px;
      }

      #mapIsNullMessage {
        display: flex;
        font-size: 30px;
        position: absolute;
        top: 45%;
        text-align: center;
        justify-content: center;
        align-items: center;
        left: 15%;
      }
    </style>
    <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services,clusterer,drawing"></script> 
  </head>
  <body>
    <div id="map"></div>
    <button id="startButton">
      <div id="startText">
        산책갈까?
      </div>
    </button>
    <button id="stopButton">
      <div id="stopText">
        집에가자!
      </div>
    </button>
    <div id="mapIsNullMessage">
      맵을 불러오고 있습니다.
    </div>
    <script>
      var startButton = document.getElementById('startButton');
      var stopButton = document.getElementById('stopButton');
      var map = null;
      var currentLocation = null;
      var marker = null;
      var markerPosition = null;
      var mapIsNullMessage = document.getElementById('mapIsNullMessage');

      var drawingFlag = false; // 선이 그려지고 있는 상태를 가지고 있을 변수입니다
      var moveLine; // 선이 그려지고 있을때 마우스 움직임에 따라 그려질 선 객체 입니다
      var clickLine // 마우스로 클릭한 좌표로 그려질 선 객체입니다
      var distanceOverlay; // 선의 거리정보를 표시할 커스텀오버레이 입니다
      var dots = {}; // 선이 그려지고 있을때 클릭할 때마다 클릭 지점과 거리를 표시하는 커스텀 오버레이 배열입니다.
      
      document.addEventListener('message', async (e) => {
        const { type, data } = JSON.parse(e.data);
        currentLocation = data;
        alert(map);
        if (!map) {
          createMap(currentLocation.latitude, -currentLocation.longitude);  
          mapIsNullMessage.style.display = 'none';
          alert('맵생성완료');
        } else {
          alert('이미맵이생성됨')
          if (drawingFlag) {
            startDrawing(currentLocation.latitude, -currentLocation.longitude);
          }
        }
      });
      
      function createMap(lat, lng) {
        var mapContainer = document.getElementById('map'); // 지도를 표시할 div 
        var mapOptions = { 
          center: new kakao.maps.LatLng(lat, lng), // 맵의 중심좌표를 현재 위치로 설정
          level: 3 // 맵의 확대 레벨
        };
        // 새로운 맵 객체 생성
        map = new kakao.maps.Map(mapContainer, mapOptions);

        // 마커가 표시될 위치입니다 
        markerPosition  = new kakao.maps.LatLng(lat, lng); 
        
        // 마커를 생성합니다
        marker = new kakao.maps.Marker({
          position: markerPosition
        });
        
        // 마커가 지도 위에 표시되도록 설정합니다
        marker.setMap(map);        
      };

      startButton.onclick = function() {
        startButton.style.display = 'none';
        stopButton.style.display = 'block';
        startDrawing(currentLocation.latitude, -currentLocation.longitude);
      }

      stopButton.onclick = function() {
        startButton.style.display = 'block';
        stopButton.style.display = 'none';
        stopDrawing();
      }
      
      function panTo(lat, lng) {
        // 이동할 위도 경도 위치를 생성합니다 
        var moveLatLon = new kakao.maps.LatLng(lat, lng);
        
        // 지도 중심을 부드럽게 이동시킵니다
        // 만약 이동할 거리가 지도 화면보다 크면 부드러운 효과 없이 이동합니다
        map.panTo(moveLatLon);

        // 마커가 표시될 위치입니다 
        markerPosition  = new kakao.maps.LatLng(lat, lng);
        
        marker.setMap(null);

        // 마커를 생성합니다
        marker = new kakao.maps.Marker({
          position: markerPosition
        });
        
        // 마커가 지도 위에 표시되도록 설정합니다
        marker.setMap(map);   
      }        
      
      // 지도에 클릭 이벤트를 등록합니다
      // 지도를 클릭하면 선 그리기가 시작됩니다 그려진 선이 있으면 지우고 다시 그립니다
      function startDrawing(lat, lng) {
        panTo(lat, lng);

        // 지도 클릭이벤트가 발생했는데 선을 그리고있는 상태가 아니면
        if (!drawingFlag) {
    
          // 상태를 true로, 선이 그리고있는 상태로 변경합니다
          drawingFlag = true;
          
          // 지도 위에 선이 표시되고 있다면 지도에서 제거합니다
          deleteClickLine();
          
          // 지도 위에 커스텀오버레이가 표시되고 있다면 지도에서 제거합니다
          deleteDistnce();

          // 지도 위에 선을 그리기 위해 클릭한 지점과 해당 지점의 거리정보가 표시되고 있다면 지도에서 제거합니다
          deleteCircleDot();
      
          // 클릭한 위치를 기준으로 선을 생성하고 지도위에 표시합니다
          clickLine = new kakao.maps.Polyline({
              map: map, // 선을 표시할 지도입니다 
              path: [new kakao.maps.LatLng(lat, lng)], // 선을 구성하는 좌표 배열입니다 클릭한 위치를 넣어줍니다
              strokeWeight: 3, // 선의 두께입니다 
              strokeColor: '#db4040', // 선의 색깔입니다
              strokeOpacity: 1, // 선의 불투명도입니다 0에서 1 사이값이며 0에 가까울수록 투명합니다
              strokeStyle: 'solid' // 선의 스타일입니다
          });
          
          // 선이 그려지고 있을 때 마우스 움직임에 따라 선이 그려질 위치를 표시할 선을 생성합니다
          moveLine = new kakao.maps.Polyline({
              strokeWeight: 3, // 선의 두께입니다 
              strokeColor: '#db4040', // 선의 색깔입니다
              strokeOpacity: 0.5, // 선의 불투명도입니다 0에서 1 사이값이며 0에 가까울수록 투명합니다
              strokeStyle: 'solid' // 선의 스타일입니다    
          });
      
          // 클릭한 지점에 대한 정보를 지도에 표시합니다
          displayCircleDot(new kakao.maps.LatLng(lat, lng), 0);
    
                
        } else { // 선이 그려지고 있는 상태이면
    
          // 그려지고 있는 선의 좌표 배열을 얻어옵니다
          var path = clickLine.getPath();

          // 좌표 배열에 클릭한 위치를 추가합니다
          path.push(new kakao.maps.LatLng(lat, lng));
          
          // 다시 선에 좌표 배열을 설정하여 클릭 위치까지 선을 그리도록 설정합니다
          clickLine.setPath(path);

          var distance = Math.round(clickLine.getLength());
          displayCircleDot(new kakao.maps.LatLng(lat, lng), distance);

          console.log(path);
        };
      };     
      
      // 지도에 마우스 오른쪽 클릭 이벤트를 등록합니다
      // 선을 그리고있는 상태에서 마우스 오른쪽 클릭 이벤트가 발생하면 선 그리기를 종료합니다
      function stopDrawing () {

        // 지도 오른쪽 클릭 이벤트가 발생했는데 선을 그리고있는 상태이면
        if (drawingFlag) {
            
          // 마우스무브로 그려진 선은 지도에서 제거합니다
          moveLine.setMap(null);
          moveLine = null;  
          
          // 마우스 클릭으로 그린 선의 좌표 배열을 얻어옵니다
          var path = clickLine.getPath();

          window.ReactNativeWebView.postMessage(JSON.stringify(path));

          // 선을 구성하는 좌표의 개수가 2개 이상이면
          if (path.length > 1) {

            // 마지막 클릭 지점에 대한 거리 정보 커스텀 오버레이를 지웁니다
            if (dots[dots.length-1].distance) {
                dots[dots.length-1].distance.setMap(null);
                dots[dots.length-1].distance = null;    
            }

            var distance = Math.round(clickLine.getLength()), // 선의 총 거리를 계산합니다
                content = getTimeHTML(distance); // 커스텀오버레이에 추가될 내용입니다
                
            // 그려진 선의 거리정보를 지도에 표시합니다
            showDistance(content, path[path.length-1]);  
              
          } else {

            // 선을 구성하는 좌표의 개수가 1개 이하이면 
            // 지도에 표시되고 있는 선과 정보들을 지도에서 제거합니다.
            deleteClickLine();
            deleteCircleDot(); 
            deleteDistnce();

          }
          
          // 상태를 false로, 그리지 않고 있는 상태로 변경합니다
          drawingFlag = false;          
        }  
      };   
      
      // 클릭으로 그려진 선을 지도에서 제거하는 함수입니다
      function deleteClickLine() {
        if (clickLine) {
          clickLine.setMap(null);    
          clickLine = null;        
        }
      }
      
      // 마우스 드래그로 그려지고 있는 선의 총거리 정보를 표시하거
      // 마우스 오른쪽 클릭으로 선 그리가 종료됐을 때 선의 정보를 표시하는 커스텀 오버레이를 생성하고 지도에 표시하는 함수입니다
      function showDistance(content, position) {
          
        if (distanceOverlay) { // 커스텀오버레이가 생성된 상태이면
            
          // 커스텀 오버레이의 위치와 표시할 내용을 설정합니다
          distanceOverlay.setPosition(position);
          distanceOverlay.setContent(content);
            
        } else { // 커스텀 오버레이가 생성되지 않은 상태이면
            
          // 커스텀 오버레이를 생성하고 지도에 표시합니다
          distanceOverlay = new kakao.maps.CustomOverlay({
            map: map, // 커스텀오버레이를 표시할 지도입니다
            content: content,  // 커스텀오버레이에 표시할 내용입니다
            position: position, // 커스텀오버레이를 표시할 위치입니다.
            xAnchor: 0,
            yAnchor: 0,
            zIndex: 3  
          });      
        }
      }
      
      // 그려지고 있는 선의 총거리 정보와 
      // 선 그리가 종료됐을 때 선의 정보를 표시하는 커스텀 오버레이를 삭제하는 함수입니다
      function deleteDistnce () {
        if (distanceOverlay) {
            distanceOverlay.setMap(null);
            distanceOverlay = null;
        }
      }
      
      // 선이 그려지고 있는 상태일 때 지도를 클릭하면 호출하여 
      // 클릭 지점에 대한 정보 (동그라미와 클릭 지점까지의 총거리)를 표출하는 함수입니다
      function displayCircleDot(position, distance) {
      
        // 클릭 지점을 표시할 빨간 동그라미 커스텀오버레이를 생성합니다
        var circleOverlay = new kakao.maps.CustomOverlay({
            content: '<span class="dot"></span>',
            position: position,
            zIndex: 1
        });
    
        // 지도에 표시합니다
        circleOverlay.setMap(map);
    
        if (distance > 0) {
            // 클릭한 지점까지의 그려진 선의 총 거리를 표시할 커스텀 오버레이를 생성합니다
            var distanceOverlay = new kakao.maps.CustomOverlay({
                content: '<div class="dotOverlay">거리 <span class="number">' + distance + '</span>m</div>',
                position: position,
                yAnchor: 1,
                zIndex: 2
            });
    
            // 지도에 표시합니다
            distanceOverlay.setMap(map);
        }
    
        // 배열에 추가합니다
        dots.push({circle:circleOverlay, distance: distanceOverlay});
      }
      
      // 클릭 지점에 대한 정보 (동그라미와 클릭 지점까지의 총거리)를 지도에서 모두 제거하는 함수입니다
      function deleteCircleDot() {
        var i;
    
        for ( i = 0; i < dots.length; i++ ){
            if (dots[i].circle) { 
                dots[i].circle.setMap(null);
            }
    
            if (dots[i].distance) {
                dots[i].distance.setMap(null);
            }
        }
    
        dots = [];
      }
      
      // 마우스 우클릭 하여 선 그리기가 종료됐을 때 호출하여 
      // 그려진 선의 총거리 정보와 거리에 대한 도보, 자전거 시간을 계산하여
      // HTML Content를 만들어 리턴하는 함수입니다
      function getTimeHTML(distance) {
    
        // 도보의 시속은 평균 4km/h 이고 도보의 분속은 67m/min입니다
        var walkkTime = distance / 67 | 0;
        var walkHour = '', walkMin = '';
    
        // 계산한 도보 시간이 60분 보다 크면 시간으로 표시합니다
        if (walkkTime > 60) {
            walkHour = '<span class="number">' + Math.floor(walkkTime / 60) + '</span>시간 '
        }
        walkMin = '<span class="number">' + walkkTime % 60 + '</span>분'
    
        var content = '<ul class="dotOverlay distanceInfo">';
        content += '    <li>';
        content += '        <span class="label">총거리</span><span class="number">' + distance + '</span>m';
        content += '    </li>';
        content += '</ul>'
    
        return content;
      }
          
    </script>    
  </body>
</html>      
`;


export default function WalkScreen ({ navigation }) {
  // const [isClick, setIsClick] = useState(false);
  // const webViewRef = useRef(null);
  
	// const handleStartViewClick = () => {
    // 	setIsClick(!isClick)
    // }
    
  // const [isDrawing, setIsDrawing] = useState(false);
  // const [time, setTime] = useState(0);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(0);
  const webViewRef = useRef(null);

  function changeLoading() {
    setTimeout(() => {
      setLoading(loading + 1);
    }, 2000);
  };

  useEffect(() => {
    (async () => {
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      webViewRef.current.postMessage(JSON.stringify({
        type: 'location',
        data: location.coords
      }));
      console.log(1, JSON.parse(JSON.stringify(location.coords)));
    })();
  }, []);

  useEffect(() => {
    const timer = setInterval(async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('현재 위치를 받아올 수 없습니다!');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }, 2000);

    return () => clearInterval(timer);
  }, [location]);

  useEffect(() => {
    if (location) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'location',
        data: location.coords
      }));
      console.log(2, JSON.parse(JSON.stringify(location.coords)));
    }
      // webViewRef.current.postMessage(JSON.stringify({
      //   type: 'latitude',
      //   // data: location.coords.latitude
      //   data: 37.6012647456244
      // }));
      // webViewRef.current.postMessage(JSON.stringify({
      //   type: 'longitude',
      //   // data: location.coords.longitude
      //   data: 127.03958123605
      // }));
  }, [location]);

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
    // console.log(location.coords.latitude);
    // console.log(location.coords.longitude);
  }
	
	// useEffect(() => {
	// 	if (!isDrawing) {
	// 		alert("산책을 시작합니다!");
	// 		setIsDrawing(true);
	// 		// console.log(webViewRef);
	// 		webViewRef.current.postMessage = "startDrawing";
	// 		// console.log(webViewRef);
	// 	} else {
	// 		alert("산책을 종료합니다!");
	// 		setIsDrawing(false);
	// 		// console.log(webViewRef);
	// 		webViewRef.current.postMessage = "stopDrawing";
	// 		console.log('진행중');
	// 		// console.log(webViewRef);
	// 	}
	// }, [isClick])

  const onMessage = (event) => {
    const message = event.nativeEvent.data;
    console.log(message);
  }

  return (
    <View style={styles.walkMainContainer}>
      {location ? (
        <WebView
          ref={webViewRef}
          style={styles.walkMainMap}
          source={{ html: htmlContainer }}
          onMessage={onMessage}
        />
      ) : (
        <View style={styles.walkMainLoading}>
          <Text style={styles.walkMainLoadingText}>현재 위치를 받아오는 중입니다!</Text>
        </View>
      )}

      {/* {location ? (
        <TouchableOpacity>
          <View style={styles.walkMainStart}>
            <Text style={styles.walkMainStartText}>산책갈까?</Text>
          </View>
        </TouchableOpacity>
      ) : null} */}

      {/* {location ? (
        <View style={styles.container}>
          <Text style={styles.paragraph}>{text}</Text>
        </View>    
      ) : null} */}

    </View>
  );
};

const styles = StyleSheet.create({
  walkMainContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.82,
  },
  walkMainMap: {
    flex: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.82,
  },
  walkMainStart: {
    width: 100,
    height: 100,
    position: "absolute",
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 100,
    bottom: 50,
    left: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "yellow",
  },
  walkMainStartText: {
    fontSize: 20,
  },
  walkMainLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  walkMainLoadingText: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
})