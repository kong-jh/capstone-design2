import sys
import pandas as pd
import xgboost as xgb
import sklearn

def bikePridict(bike_id, day, weather):
    bike_id = bike_id.split('.')[0]
    #print('bike_id:', bike_id)
    model = xgb.XGBRegressor()
    model.load_model('./model/'+bike_id+'.model')
    
    #print(weather.split(','))
    data = pd.DataFrame(columns=['월', '대여시간', '기온(°C)', '풍향(deg)', '풍속(m/s)', '강수량(mm)', '습도(%)',
                                 '요일_0', '요일_1', '요일_2', '요일_3', '요일_4', '요일_5', '요일_6'])
    weather = weather.split(',')
    weather.extend([0, 0, 0, 0, 0, 0, 0])
    data.loc[0] = weather
    data = data.astype('float')
    data.loc[0, '요일_'+day] = 1

    result = model.predict(data)[0]
    
    print(round(result))
    return result
                        

if __name__ == '__main__':
    bikePridict(sys.argv[1], sys.argv[2], sys.argv[3])
