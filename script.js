"use strict";

// let request = require('request');
// let async = require('async');
// let fs = require('fs');
//
// fs.readFile('./addresses.txt', (err, text) => {
//   let lines = text.toString().split("\n");
//   async.eachSeries(lines, (line, callback) => {
//     request({
//       url: 'https://maps.googleapis.com/maps/api/geocode/json',
//       qs: {
//         key: 'AIzaSyAet26YCQd0OiWBjlxA4OwBWJAhr3hNVoo',
//         region: 'eg',
//         address: line.trim(),
//       }
//     }, (err, response, body) => {
//       let data = JSON.parse(body);
//       if (data.results.length > 0) {
//         console.log(`${data.results[0].place_id}`);
//       } else {
//         console.log(`Zero Results`);
//       }
//       callback(null);
//     });
//   });
// });


let x = {
  "destination_addresses": [
    "شارع المقطم، الأباجية، قسم الخليفة، محافظة القاهرة\u202c، مصر",
    "طلعت مصطفى، محافظة القاهرة\u202c، مصر",
    "Banks Center St, Cairo Governorate, مصر",
    "عباس العقاد، المنطقة الأولى، مدينة نصر، محافظة القاهرة\u202c، مصر",
    "مكرم عبيد، المنطقة السادسة، مدينة نصر، محافظة القاهرة\u202c، مصر",
    "نجيب المستكاوي، معادي السرايات الغربية، المعادي، محافظة القاهرة\u202c، مصر",
    "ميدان فلسطين, El-Basatin Sharkeya, El-Basatin, Cairo Governorate, مصر",
    "أحمد راغب باشا، محافظة القاهرة\u202c، مصر",
    "190-192 النزهة، المطار، قسم النزهة، محافظة القاهرة\u202c، مصر",
    "222 فهمى محمود يوسف، المطار، قسم النزهة، محافظة القاهرة\u202c، مصر",
    "محمد أبو سيف، الهايكستب، قسم النزهة، محافظة القاهرة\u202c، مصر",
    "11 إبراهيم اللقاني، المنتزه، مصر الجديدة، محافظة القاهرة\u202c، مصر",
    "عسكر، الزيتون الشرقية، الزيتون، محافظة القاهرة\u202c، مصر",
    "سيدي بلال، الخصوص، الخانكة، محافظة القاهرة\u202c، مصر",
    "مصر و السودان، حدائق القبة، محافظة القاهرة\u202c، مصر",
    "القاهرة - الواسطي، الإنشا والمنيرة، السيدة زينب، محافظة القاهرة\u202c، مصر",
    "9 زكريا أحمد، محافظة القاهرة\u202c، مصر",
    "حبيبة الحجار، محافظة القاهرة\u202c، مصر",
    "15 عبد المنعم سند، مدينة الأعلام، العجوزة، الجيزة، مصر",
    "شارع السودان، بولاق الدكرور، قسم بولاق الدكرور، الجيزة، مصر",
    "الهرم، العمرانية الغربية، العمرانية، الجيزة، مصر",
    "شارع الملك فيصل، الهرم، الجيزة، مصر",
    "ممدوح سالم، إمبابة، الجيزة، مصر",
    "محور 26 يوليو، الجيزة، مصر",
    "المحور المركزي، الجيزة، مصر",
    "شارع سيدي المتولي، العطارين شرق، قسم العطارين، الإسكندرية، مصر",
    "301 الدكتور محمود فوزي، سيدي جابر، قسم سيدى جابر، الإسكندرية، مصر",
    "جمال عبد الناصر، سان ستفانو، قسم الرمل، الإسكندرية، مصر",
    "20 الفيومي، أبو النواتير، قسم سيدى جابر، الإسكندرية، مصر",
    "مدرسة الادريسي، العجمي البحري، قسم الدخيلة، الإسكندرية، مصر",
    "جمال عبد الناصر، المندرة بحري، قسم المنتزه، الإسكندرية، مصر",
    "24 توت عنخ امون، عزبة سعد، قسم سيدى جابر، الإسكندرية، مصر",
    "مارينا العلمين، مركز العلمين، مطروح، مصر",
    "طريق الإسكندرية - مرسى مطروح، مركز العلمين، مطروح، مصر",
    "طريق الإسكندرية - مرسى مطروح، مركز العلمين، مطروح، مصر",
    "يوليو-23، السويس، مصر",
    "عدلي، الإسماعيلية، مصر",
    "الإسكندرية، طنطا (قسم 2)، طنطا، الغربية، مصر",
    "بور سعيد، المنصورة (قسم 2)، المنصورة، الدقهلية، مصر",
    "شارع محمود نصر، المحلة الكبرى (قسم 2)، المحلة الكبرى، الغربية، مصر",
    "الشهيد عباس الأعسر، طاموس، قسم دمنهور، البحيرة، مصر",
    "جمال عبد الناصر، قسم شبين الكوم، شبين الكوم، المنوفية، مصر",
    "كمال الدين حسين، بطا، بنها، القليوبية، مصر",
    "العروبة، مدينة دكرنس، دكرنس، الدقهلية، مصر",
    "شارع المحافظة، الصيادين، قسم ثان الزقازيق، الشرقية، مصر",
    "يوليو-26، قسم الفيوم، الفيوم، مصر",
    "Sharobim, Qism Bani Sweif, Bani Sweif, Beni Suef Governorate, مصر",
    "محمود حسين، قسم المنيا، المنيا، مصر",
    "ممشى أبراج السعوديين، أسيوط، مصر",
    "أحمد عبد الله، الحمراء الثانية، قسم ثان أسيوط، أسيوط، مصر",
    "Unnamed Road, El Beheira Governorate, مصر",
    "بحري البلد، قسم قنا، قنا، مصر",
    "Fatyat Ibn Moslem, Gazirat Al Awameyah, Luxor, Luxor Governorate, مصر",
    "كورنيش النيل، شياخة ثالثة، قسم أسوان، أسوان، مصر",
    "السلام، قسم شرم الشيخ، جنوب سيناء، مصر",
    "النصر، قسم الغردقة، البحر الأحمر، مصر",
    "Unnamed Road, Qesm Hurghada, Red Sea Governorate, مصر"
  ],
  "origin_addresses": [
    "مدينه نصر، المنطقة الأولى، مدينة نصر، محافظة القاهرة\u202c، مصر"
  ],
  "rows": [
    {
      "elements": [
        {
          "distance": {
            "text": "7.6 ميل",
            "value": 12197
          },
          "duration": {
            "text": "22 دقيقة",
            "value": 1335
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "14.6 ميل",
            "value": 23501
          },
          "duration": {
            "text": "34 دقيقة",
            "value": 2034
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "10.0 ميل",
            "value": 16088
          },
          "duration": {
            "text": "23 دقيقة",
            "value": 1358
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "1.2 ميل",
            "value": 1875
          },
          "duration": {
            "text": "7 دقيقة",
            "value": 425
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "2.2 ميل",
            "value": 3465
          },
          "duration": {
            "text": "11 دقيقة",
            "value": 643
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "12.2 ميل",
            "value": 19564
          },
          "duration": {
            "text": "32 دقيقة",
            "value": 1895
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "10.2 ميل",
            "value": 16393
          },
          "duration": {
            "text": "27 دقيقة",
            "value": 1599
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "20.4 ميل",
            "value": 32846
          },
          "duration": {
            "text": "50 دقيقة",
            "value": 3027
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "6.7 ميل",
            "value": 10830
          },
          "duration": {
            "text": "22 دقيقة",
            "value": 1342
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "7.5 ميل",
            "value": 12110
          },
          "duration": {
            "text": "21 دقيقة",
            "value": 1285
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "8.5 ميل",
            "value": 13670
          },
          "duration": {
            "text": "27 دقيقة",
            "value": 1628
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "3.8 ميل",
            "value": 6188
          },
          "duration": {
            "text": "17 دقيقة",
            "value": 997
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "5.3 ميل",
            "value": 8583
          },
          "duration": {
            "text": "27 دقيقة",
            "value": 1624
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "8.8 ميل",
            "value": 14164
          },
          "duration": {
            "text": "29 دقيقة",
            "value": 1726
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "5.2 ميل",
            "value": 8357
          },
          "duration": {
            "text": "21 دقيقة",
            "value": 1269
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "9.3 ميل",
            "value": 14964
          },
          "duration": {
            "text": "31 دقيقة",
            "value": 1882
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "7.2 ميل",
            "value": 11619
          },
          "duration": {
            "text": "21 دقيقة",
            "value": 1271
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "6.8 ميل",
            "value": 10967
          },
          "duration": {
            "text": "21 دقيقة",
            "value": 1247
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "9.9 ميل",
            "value": 15885
          },
          "duration": {
            "text": "30 دقيقة",
            "value": 1793
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "11.4 ميل",
            "value": 18382
          },
          "duration": {
            "text": "36 دقيقة",
            "value": 2146
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "11.5 ميل",
            "value": 18437
          },
          "duration": {
            "text": "38 دقيقة",
            "value": 2287
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "13.8 ميل",
            "value": 22194
          },
          "duration": {
            "text": "48 دقيقة",
            "value": 2901
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "12.6 ميل",
            "value": 20352
          },
          "duration": {
            "text": "37 دقيقة",
            "value": 2212
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "25.0 ميل",
            "value": 40219
          },
          "duration": {
            "text": "53 دقيقة",
            "value": 3153
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "29.2 ميل",
            "value": 47028
          },
          "duration": {
            "text": "1 ساعة 2 دقيقة",
            "value": 3730
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "144 ميل",
            "value": 231841
          },
          "duration": {
            "text": "2 ساعة 48 دقيقة",
            "value": 10061
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "145 ميل",
            "value": 233937
          },
          "duration": {
            "text": "2 ساعة 50 دقيقة",
            "value": 10228
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "148 ميل",
            "value": 238802
          },
          "duration": {
            "text": "3 ساعة 3 دقيقة",
            "value": 10994
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "145 ميل",
            "value": 233932
          },
          "duration": {
            "text": "2 ساعة 55 دقيقة",
            "value": 10503
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "131 ميل",
            "value": 211377
          },
          "duration": {
            "text": "2 ساعة 32 دقيقة",
            "value": 9124
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "151 ميل",
            "value": 242985
          },
          "duration": {
            "text": "3 ساعة 10 دقيقة",
            "value": 11394
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "145 ميل",
            "value": 232568
          },
          "duration": {
            "text": "2 ساعة 51 دقيقة",
            "value": 10277
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "166 ميل",
            "value": 267064
          },
          "duration": {
            "text": "3 ساعة 3 دقيقة",
            "value": 10978
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "172 ميل",
            "value": 276425
          },
          "duration": {
            "text": "3 ساعة 11 دقيقة",
            "value": 11459
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "187 ميل",
            "value": 300152
          },
          "duration": {
            "text": "3 ساعة 26 دقيقة",
            "value": 12372
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "80.8 ميل",
            "value": 130066
          },
          "duration": {
            "text": "1 ساعة 49 دقيقة",
            "value": 6558
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "72.2 ميل",
            "value": 116248
          },
          "duration": {
            "text": "1 ساعة 40 دقيقة",
            "value": 5985
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "65.7 ميل",
            "value": 105659
          },
          "duration": {
            "text": "2 ساعة 8 دقيقة",
            "value": 7702
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "82.1 ميل",
            "value": 132172
          },
          "duration": {
            "text": "2 ساعة 42 دقيقة",
            "value": 9749
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "77.1 ميل",
            "value": 124129
          },
          "duration": {
            "text": "2 ساعة 32 دقيقة",
            "value": 9144
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "97.9 ميل",
            "value": 157526
          },
          "duration": {
            "text": "2 ساعة 43 دقيقة",
            "value": 9750
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "50.6 ميل",
            "value": 81399
          },
          "duration": {
            "text": "1 ساعة 45 دقيقة",
            "value": 6281
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "34.2 ميل",
            "value": 55080
          },
          "duration": {
            "text": "1 ساعة 20 دقيقة",
            "value": 4811
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "93.9 ميل",
            "value": 151056
          },
          "duration": {
            "text": "3 ساعة 12 دقيقة",
            "value": 11521
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "49.3 ميل",
            "value": 79270
          },
          "duration": {
            "text": "1 ساعة 40 دقيقة",
            "value": 5977
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "73.8 ميل",
            "value": 118699
          },
          "duration": {
            "text": "1 ساعة 54 دقيقة",
            "value": 6844
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "94.4 ميل",
            "value": 151846
          },
          "duration": {
            "text": "2 ساعة 7 دقيقة",
            "value": 7644
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "168 ميل",
            "value": 270993
          },
          "duration": {
            "text": "3 ساعة 11 دقيقة",
            "value": 11480
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "235 ميل",
            "value": 378103
          },
          "duration": {
            "text": "4 ساعة 18 دقيقة",
            "value": 15483
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "236 ميل",
            "value": 379137
          },
          "duration": {
            "text": "4 ساعة 21 دقيقة",
            "value": 15662
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "107 ميل",
            "value": 172268
          },
          "duration": {
            "text": "3 ساعة 4 دقيقة",
            "value": 11038
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "361 ميل",
            "value": 580944
          },
          "duration": {
            "text": "6 ساعة 3 دقيقة",
            "value": 21784
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "411 ميل",
            "value": 661338
          },
          "duration": {
            "text": "7 ساعة 10 دقيقة",
            "value": 25773
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "542 ميل",
            "value": 872589
          },
          "duration": {
            "text": "10 ساعة 4 دقيقة",
            "value": 36257
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "306 ميل",
            "value": 492134
          },
          "duration": {
            "text": "5 ساعة 33 دقيقة",
            "value": 19953
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "277 ميل",
            "value": 445284
          },
          "duration": {
            "text": "4 ساعة 49 دقيقة",
            "value": 17365
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "273 ميل",
            "value": 439424
          },
          "duration": {
            "text": "4 ساعة 47 دقيقة",
            "value": 17238
          },
          "status": "OK"
        }
      ]
    }
  ],
  "status": "OK"
};

let elements = x.rows[0].elements;

elements.forEach((ele, index) => {
  ele.address = x.destination_addresses[index];
});

let elements2 = elements.sort((a, b) => {
  let valueA = a.distance.value, valueB = b.distance.value;
  if (valueA > valueB) {
    return 1;
  } else if (valueA < valueB) {
    return -1;
  } else {
    return 0;
  }
});

elements2 = elements2.map(ele => ele.distance.text);
elements = elements.map(ele => ele.distance.text);


let x = {
  resource: "/{proxy+}",
  path: "/webhookRoutes/",
  httpMethod: "POST",
  headers: {
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, sdch, br",
    "Accept-Language": "en-US,en;q=0.8,ar;q=0.6,fr;q=0.4",
    "cache-control": "no-cache",
    "CloudFront-Forwarded-Proto": "https",
    "CloudFront-Is-Desktop-Viewer": "true",
    "CloudFront-Is-Mobile-Viewer": "false",
    "CloudFront-Is-SmartTV-Viewer": "false",
    "CloudFront-Is-Tablet-Viewer": "false",
    "CloudFront-Viewer-Country": "EG",
    dnt: "1",
    Host: "cwoy7l8ik3.execute-api.eu-central-1.amazonaws.com",
    pragma: "no-cache",
    "upgrade-insecure-requests": "1",
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
    Via: "2.0 f5998c9d122870daf12bede19b58a096.cloudfront.net (CloudFront)",
    "X-Amz-Cf-Id": "cuEIIo3gAn0H7HwJ4ZYmj73pU5F3MyBTj7rdDwNMhihzfkjXEOs30g==",
    "X-Amzn-Trace-Id": "Root=1-58c98ade-6b1395b417c34d013452cc51",
    "X-Forwarded-For": "196.129.6.144, 54.239.166.58",
    "X-Forwarded-Port": "443",
    "X-Forwarded-Proto": "https"
  },
  queryStringParameters: null,
  pathParameters: {proxy: "webhookRoutes"},
  stageVariables: {lambdaVersion: "latest"},
  requestContext: {
    accountId: "478020368365",
    resourceId: "lxda0m",
    stage: "latest",
    requestId: "03e49c17-09af-11e7-b8e2-bd3f6314d478",
    identity: {
      cognitoIdentityPoolId: null,
      accountId: null,
      cognitoIdentityId: null,
      caller: null,
      apiKey: null,
      sourceIp: "196.129.6.144",
      accessKey: null,
      cognitoAuthenticationType: null,
      cognitoAuthenticationProvider: null,
      userArn: null,
      userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
      user: null
    },
    resourcePath: "/{proxy+}",
    httpMethod: "POST",
    apiId: "cwoy7l8ik3"
  },
  body: JSON.stringify({
    "object": "page",
    "entry": [
      {
        "id": "811563838979506",
        "time": 1489587424188,
        "messaging": [
          {
            "sender": {
              "id": "1071518169596482"
            },
            "recipient": {
              "id": "811563838979506"
            },
            "timestamp": 1489587424085,
            "message": {
              "mid": "mid.1489587424085:b760173688",
              "seq": 1068443,
              "text": "fdsgfdhdfs"
            }
          }
        ]
      }
    ]
  }),
  isBase64Encoded: false
}