<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <script src="https://api-maps.yandex.ru/2.1/?apikey=7a43dc77-4610-4d0a-b182-327a40810f40&lang=ru_RU&load=package.full" type="text/javascript"></script>
  <script src="map.js"></script>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <?php
  $json = json_decode(file_get_contents("offices.json"), true);
  ?>
  <div id="map-data">
    <div class="country-city">
      <div class="btn-wrapper">
        <?php
        foreach($json as $key=>$value){
          ?><button data-country="<?=$key?>" data-coords=""><?=$value[0]?></button><?php
        }
        ?>
      </div>
      <div class="city-wrapper"><?php
        foreach($json as $key=>$value){
          ?><div class="city-list <?=$key?>"><?php 
          for($i=1; $i<count($value); $i++){
            ?><details>
              <summary><?=$value[$i]["city"]?></summary><?php 
              $offices = $value[$i]["offices"];
              foreach($offices as $f){?>
                <div class="office">
                  <p class="addres"><?=$f["addres"]?></p>
                  <p><?=$f["name"]?></p>
                  <div class="phone-wrapper">
                    <?php foreach($f["phone"] as $p){
                      ?><p><?=$p?></p><?php
                    }?>
                  </div>
                  <div class="email-wrapper">
                    <?php foreach($f["email"] as $e){
                        ?><p><?=$e?></p><?php
                    }?>
                  </div>
                </div>
              <?php }?>
            </details><?php
          }
          ?>
        </div><?php
        }
      ?></div>
    </div>
    <div id="map-id"></div>
  </div>
</body>
</html>
