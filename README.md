# 대여소 기반 라스트마일 이동수단 예측 맵 서비스
> 라스트마일 이동수단을 이용하기 위해 필요한 정보 제공   
> - 공공자전거 대여소 위치, 실시간 현황, 대여 예측 정보, 날씨      

## 연구 배경
최근 교통이 발달하면서 다양한 교통수단이 등장하였고, 공유 이동수단에 대한 관심과 이용이 또한 점점 증가하고 있다.
자전거, 전동 킥보드 등의 공유 이동수단은 단거리 이동에서 효율적으로 이용될 수 있어 라스트마일 이동수단으로 유용하다.
라스트마일이란, 목적지까지 남은 단거리의 최종구간을 말한다.
라스트마일 이동수단은 버스, 지하철과 달리 기다릴 필요없이 언제 어디서나 이용할 수 있어 유동적이고 편리하여, 대중교통으로 가기 힘든 거리를 라스트마일 이동수단을 이용하면 빠르고 간편하게 이동할 수 있다.
하지만 사용하려는 시간과 장소에 없는 경우 라스트마일 이동수단으로 이용되기 어렵다.


대여소 이용 예측 모델 연구와 공공자전거 관련 기존 서비스는 존재하였지만
예측 모델을 이용하여 사용자에게 대여 예측 정보를 제공하는 서비스는 없었다.
따라서 사용자에게 대여 예측 정보와 이용에 필요한 정보를 함께 제공하는 서비스를 제안 및 구현하고자 한다.
이동수단 이용 계획에 활용하여 라스트마일 이동수단이 더 효율적으로 이용될 수 있도록 개선한다.  

## About The Project

**대여소 기반 라스트마일 이동수단 예측 맵 서비스 개발**

* 주요 기능
  * 대여소 위치 및 날씨 정보 확인
  * 실시간 현황 확인
  * 대여소 길찾기
  * 대여 예측 기능

## 프로젝트 설명
### 파일 구조
```
.  
│ .gitignore  
│ app.js  
│ bikePredict.ipynb  
│ bikeSeoul.csv  
│ package-lock.json  
│ package.json  
│ predict.py  
├─model  
│ 4102.model  
│ …  
│ 681.model  
└─views  
 api_view.ejs  
 bike_view.ejs  
 predict_view.ejs  
 view.ejs  
```
### 시스템 구성
![architecture](https://user-images.githubusercontent.com/56243417/205482999-845291a0-e4be-4202-b2ee-dbb80cf91aa3.PNG)

### 예측 동작 흐름
![predict_sequence](https://user-images.githubusercontent.com/56243417/205483010-087da331-8e4f-42a4-bbe0-ace7a39f3b12.PNG)
1. 원하는 대여소, 시간대 선택
2. 사용자가 선택한 대여소(id), 시간대(hour) 정보를 parameter로 서버에 전달
3. 현재 날짜, 시간 정보를 추출, 이용하여 기상청 초단기예보 API 호출 -> 사용자가 원하는 시간대의 날씨 추출
4. 공공자전거 실시간 대여정보 API 호출 -> 원하는 대여소의 잔여 자전거 수 추출
5. 대여소번호, 날짜, 시간, 날씨를 Argument로 전달하여 predict.py 실행
6. 대여소번호에 해당하는 예측모델을 load하여 날짜, 시간, 날씨 정보를 통해 예측한 값 전달 (예측모델은 미리 학습하여 /model에 저장)
7. 예측 잔여량을 계산하여 웹에 전달 ((실시간 잔여량) - (대여 예측값))

## 프로젝트 결과
1. Main : 공공자전거 대여소 위치 및 날씨 확인
![main](https://user-images.githubusercontent.com/56243417/205493607-ce0bf5c1-cf8e-411b-b1a1-dc439e74fc86.PNG)

2. 🚩대여소 실시간 현황 : 대여소별 실시간 잔여 자전거 수 확인 및 대여소 길찾기
![bikestatus](https://user-images.githubusercontent.com/56243417/205493622-f042d910-b065-46c6-b3c1-d30a7a38c45a.PNG)

3. ⌚공공자전거 예측 정보 : 대여소별, 시간대별 예측 정보 확인
![predict1](https://user-images.githubusercontent.com/56243417/205493630-07f5e06a-8ae3-4e7c-8a34-3b0e1efe05cb.PNG)
![predict2](https://user-images.githubusercontent.com/56243417/205493648-c7cdec49-58b5-4880-b7d7-4149236ba329.PNG)
