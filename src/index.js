import express from 'express';
import cors from 'cors';
import fetch from 'isomorphic-fetch';
import Promise from 'bluebird';
import bodyParser from 'body-parser';


const pcUrl = 'https://gist.githubusercontent.com/isuvorov/ce6b8d87983611482aac89f6d7bc0037/raw/pc.json';
let pc = {};

const app = express();
app.use(bodyParser.json());
app.use(cors());

// импорт модели конфигурации PC
fetch(pcUrl)
  .then(async (res) => {
    pc = await res.json();
})
  .catch(err => {
    console.log('ошибка чтения модели:', err);
    return {'error': 'ошибка чтения модели:' + err};
  });

app.get(/.*/, async (req, res) => {
  //console.log('req.path= ' + req.path);
  if (req.path === '/volumes'){
    //console.log('for:');
    var hdds = pc['hdd'];
    var hdd = {};
    var volumes = {};
    var volumes_str = {}
    // подсчет количества байтов на дисках
    for (var i in hdds) {
      console.log( 'for i=' + i + ' : ' + hdds[i] );
      hdd = hdds[i];
      console.log( 'hdd= ' + hdd.volume + ' ' + hdd.size );
      if (volumes[hdd.volume] === undefined) {
        volumes[hdd.volume] = hdd.size;
      } else {
        volumes[hdd.volume] = volumes[hdd.volume] + hdd.size;
      };
    };
    //преобразование размера томов в строку
    for (var i in volumes) {
      console.log( 'before for i=' + i + ' : ' + volumes[i] );
      volumes_str[i] = String(volumes[i]) + 'B';
      //volumes[i] = String(volumes[i]) + 'B';
      console.log( 'after for i=' + i + ' : ' + volumes_str[i] );
    };
    // отправка ответа
    res.status(200).json(volumes_str);
  } else { // все запросы кроме volume
    var arrKey = req.path.slice(1).split(/\//);
    var resp = pc;
    var isArr = false;
    var isString = false;
    //console.log('for:');
    for (var i in arrKey) {
      //console.log( 'for i=' + i + ' : ' + arrKey[i] + ' isArr=' + isArr + ' isString=' + isString + ' isNaN=' + isNaN(arrKey[i]));
      if ( arrKey[i] === '' ) {
        return res.status(200).json(resp);
      };
      // если объект в предыдущей итерации является массивом или строкой,
      //и текущее свойство не является числовым индексом
      //возвращаем: res.status(404).send("Not Found")
      if ( (isArr && isNaN(arrKey[i])) || isString ) {
        return res.status(404).send('Not Found');
      };

      if (resp[arrKey[i]] === undefined) {
        return res.status(404).send('Not Found');
      } else {
        resp = resp[arrKey[i]];
      };
      // сохраним признак того, что текущий объект является массивом или строкой,
      // обрабатываем его на следующей итерации цикла
      isArr = resp instanceof Array;
      isString = typeof(resp) === 'string';
      //console.log('chek: ' + resp + ' = ' + typeof(resp));
    };
    //console.log(resp);
    res.status(200).json(resp);
  };
});

app.listen(3000, () => {
  console.log('Your app listening on port 3000!');
});
