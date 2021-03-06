
//ボールのx座標、y座標、x軸方向の速度、y軸方向の速度
var ballpara =[[500 , 150 , 0 , 0]] ;
ballpara.push([160 , 150 , 0 , 0]) ;
ballpara.push([140 , 140 , 0 , 0]) ;
ballpara.push([140 , 160 , 0 , 0]) ;
ballpara.push([120 , 130 , 0 , 0]) ;
ballpara.push([120 , 170 , 0 , 0]) ;
ballpara.push([100 , 140 , 0 , 0]) ;
ballpara.push([100 , 160 , 0 , 0]) ;
ballpara.push([80 , 150 , 0 , 0]) ;
ballpara.push([120 , 150 , 0 , 0]) ;

var shotflag = 10 ; //ショットの強さ

var remainflag = new Array(10).fill(1) ; //残っているボール

function mainlp(Curball , missflag)//メインループ
{
  shotflag = 0 ;
  const radius = 10 ; //ボールの半径
  const friction = 100 ;  //摩擦係数
  const drowt = 10 ; //描画周期
  const simt = 1 //演算周期

  const ballcoler = ["white" , "yellow" , "blue" , "green" , "red" , "purple" , "black" , "orange" , "gray" , "brown"] ;

  let ball = [] ;
  let fallflag = 1 ;
  

  for (let i = 0 ; i < 10 ; i++ )
  {
    ball.push([Curball[i][0] , Curball[i][1] , Curball[i][2] , Curball[i][3]]);
  }

  for(let count =0 ; count < drowt / simt ; count++)
  {
    //ボールの物理量更新
    for (let i = 0 ; i < 10 ; i++ )
    {
      let fall = 10 ;
      let Pos = [ball[i][0] , ball[i][1]] ;
      let V = [ball[i][2] , ball[i][3]] ;
      [Pos , V , fall] = ballpos(Pos , V , simt , 600 , 300 , radius , i) ;
      [ball[i][0] , ball[i][1]] = Pos ;
      [ball[i][2] , ball[i][3]] = V ;
      fallflag *= fall ;
    }
    //ボールの衝突
    for(i = 0 ; i < 10 ; i++)
    {
      let coll = 1 ;
      for(let j= 0 ; j < 9 - i ; j++)
      {
        let Pos1 = [ball[i][0] , ball[i][1]] ;
        let Pos2 = [ball[j + i + 1][0] , ball[j + i + 1][1]] ;
        let V1 = [ball[i][2] , ball[i][3]] ;
        let V2 = [ball[j + i + 1][2] , ball[j + i + 1][3]] ;
        [V1 , V2 , coll] = collision(Pos1 , Pos2 , V1 , V2 , radius) ;
        [ball[i][2] , ball[i][3]] = V1 ;
        [ball[j + i + 1][2] , ball[j + i + 1][3]] = V2 ;

        if(i == 0 && coll == -1)
        {
          coll = remainflag[0] - (j + 1) ;
          missflag *= coll ;
        }
      }
    }
    for(i = 0 ; i < 10 ; i++ )
    //次回のボール速度計算
    {
      [ball[i][2] , ball[i][3]] = velocity([ball[i][2] , ball[i][3]] , friction , simt) ;
    } 
  }
  if (fallflag == 0 || missflag < 0)
  { 
    alert("へたくそ(((^_^;)") ;
    obj = document.getElementById("table").getContext("2d") ;
    obj.clearRect(10, 10, 580, 280);
  
    //ボール描画
    for (let i = 0 ; i < 10 ; i++ )
    {
      obj.beginPath() ;
      obj.fillStyle = ballcoler[i] ;
      obj.arc(ballpara[i][0] , ballpara[i][1] , radius , 0 , 2 * Math.PI , true ) ;
      obj.fill() ;
      obj.closePath() ;
    }
    shotflag = - 1 ;
    ballpara[0][3] = 0 ;
    ballpara[0][2] = - 1 ;
  }
  else
  {
    //停止判定
    let flag = stopjudge(10 , ball) ;
    if(flag == 0)
    {
      shotflag = - 1 ;
      ballpara = ball ;
      ballpara[0][2] = - 1 ;
      for(let i = 0 ; i < 9 ; i++)
      {
        if(ballpara[9 - i][1] == 1000)
        {
          remainflag[9 - i] = 0 ;
        }
        else
        {
          remainflag[0] = 9 - i ;
        }
      }
      rot(0) ;
    }
    else
    {
      setTimeout(mainlp , drowt , ball , missflag) ;
    }
  
    //ボール描画準備
    let obj = document.getElementById("table").getContext("2d") ;
    obj.clearRect(10, 10, 580, 280);
  
  //ボール描画
    for (let i = 0 ; i < 10 ; i++ )
    {
      obj.beginPath() ;
      obj.fillStyle = ballcoler[i] ;
      obj.arc(ball[i][0] , ball[i][1] , radius , 0 , 2 * Math.PI , true ) ;
      obj.fill() ;
      obj.closePath() ;
    }
  }
}

function velocity(vect , friction , deltat) //速度計算関数
{
  let V = [0 , 0] ;
  let flag = innerpro(vect , vect) ;
  //ベクトルの大きさが0以上なら摩擦で減速
  if(flag > 0.01)
  {
    V = unitvect(vect) ;
    V = svect(V , friction * deltat /1000) ; //摩擦で減速する速度ベクトル
    V = vectdif(vect , V) ;
  }
  return V ;
}

function ballpos(Pos , V , deltat , limitx , limity , radius , num) //ボール位置計算関数
{
  let reflect = radius + 10 ;
  let flag = -1 ;
  Pos = vectadd(Pos , svect(V , deltat / 1000)) ;

//端での反射
  if (Pos[0] < reflect)
  {
    if (Pos[1] < 30 || 270 < Pos[1])
    {
      flag = 1 ;
    }
    else
    {
      Pos[0] = 2 * reflect - Pos[0] ;
      V[0] = - V[0] ;
    }
  }
  else if (Pos[0] > limitx - reflect)
  {
    if (Pos[1] < 30 || 270 < Pos[1])
    {
      flag = 1 ;
    }
    else
    {
      Pos[0] = 2 * limitx - 2 * reflect - Pos[0] ;
      V[0] = - V[0] ;
    }
  }
  else if (Pos[1] < reflect)
  {
    if (Pos[0] < 30 || (280 < Pos[0] && Pos[0] < 320) || 570 < Pos[0])
    {
      flag = 1 ;
    }
    else
    {
      Pos[1] = 2 * reflect - Pos[1] ;
      V[1] = - V[1] ;
    }
  }
  else if (Pos[1] > limity - reflect)
  {
    if (Pos[0] < 30 || (280 < Pos[0] && Pos[0] < 320) || 570 < Pos[0])
    {
      flag = 1 ;
    }
    else
    {
      Pos[1] = 2 * limity - 2 * reflect - Pos[1] ;
      V[1] = - V[1] ;
    }
  }
  if (flag == 1)
  {
    Pos = [1000 , 1000] ;
    V = [0 , 0] ;
    flag *= num ;
  }
  
  return [Pos , V , flag] ;
}

function collision(Pos1 , Pos2 , V1 , V2 , radius) //ボールの衝突関数
{
  let Distance = vectdif(Pos1 , Pos2) ; //ボール間の位置ベクトル
  //ボール間の距離がボール半径の2倍以内なら衝突
  //相対速度ベクトルとボール間の位置ベクトルの内積が正なら衝突
  let flag = Math.pow(Distance[0] , 2) + Math.pow(Distance[1] , 2) ;
  let inpro = innerpro(Distance , vectdif(V1 , V2));
  if (flag < 4 * radius * radius && inpro < 0)
  {
    /*衝突面の水平方向と垂直方向にボールの速度ベクトルを分解
        A・B = |A||B|cosθ →|A|cosθ = (A・B)/|B|なので、
        Bが衝突面と垂直なベクトルならVver = (V・B)/|B| (B/|B|)となる。
        衝突面と水平方向も同様*/
    inpro = innerpro(Distance , V1) ;
    let V1para = svect(Distance , inpro / flag) ;
    inpro = innerpro(Distance , V2) ;
    let V2para = svect(Distance , inpro / flag) ;
    let Ver = vertical(Distance) ;
    inpro = innerpro(Ver , V1) ;
    let V1ver = svect(Ver , inpro / flag) ; 
    inpro = innerpro(Ver , V2) ;
    let V2ver = svect(Ver , inpro / flag) ;
   /*反発係数を1とすると、衝突面と垂直な
      速度ベクトルを交換するだけでOK*/
    V1 = vectadd(V2para , V1ver) ;
    V2 = vectadd(V1para , V2ver) ;
    flag = -1 ;
  }
  return [V1 , V2 , flag] ;
} 

function stopjudge(n , ball) //すべてのボールの停止判定
{
  let flag = 0
  for(i = 0 ; i < n ; i++)
  {
    let V = [ball[i][2] , ball[i][3]]
    flag += innerpro(V , V) ;
  }
  return flag ;
}

function vectadd(vectA , vectB) //ベクトルの足し算
{
  let vect =[0 , 0] ;
  for (let i = 0 ; i < 2 ; i++)
  {
    vect[i] = vectA[i] + vectB[i] ;
  }
  return vect ;
}

function vectdif(vectA , vectB) //ベクトルの引き算
{
  let vect =[0 , 0] ;
  for (let i = 0 ; i < 2 ; i++)
  {
    vect[i] = vectA[i] - vectB[i] ;
  }
  return vect ;
}

function innerpro(vectA , vectB) //ベクトルの内積
{
  let pro = vectA[0] * vectB[0] + vectA[1] * vectB[1] ;
  return pro ;
}

function invers(matr) //逆行列 ←使ってない
{
  let delta = matr[0][0] * matr[1][1] - matr[1][0] * matr[0][1] ;
  let temp = matr[0][0] ;
  matr[0][0] = matr[1][1] / delta ;
  matr[1][1] = temp / delta ;
  matr[0][1] = - matr[0][1] / delta ;
  matr[1][0] = - matr[1][0] / delta ;
  return matr ;
}

function matrpro(matr , vect)  //行列とベクトルのかけ算
{
  let vectpro = [0 , 0] ;
  for (let i = 0 ; i < 2 ; i++)
  {
    vectpro[i] = matr[i][0] * vect[0] + matr[i][1] * vect[1] ;
  }
  return vectpro ;
}

function vertical(vect)  //直交するベクトル
{
  let V = [0 , 0] ;
  V[1] = - vect[0] ;
  V[0] = vect[1] ;
  return  V ;
}

function unitvect(vect)  //単位ベクトル化
{
  let V = [0 , 0] ;
  let delta = Math.sqrt(Math.pow(vect[0] , 2) +Math.pow(vect[1] , 2)) ;
  for (let i = 0 ; i < 2 ; i++)
  {
    V[i] = vect[i] / delta ;
  }
  return V ;
}

function svect(vect , s)  //ベクトルのスカラー倍
{
  let V = [0 , 0] ;
  for (let i = 0 ; i < 2 ; i++)
  {
    V[i] = vect[i] * s ;
  }
  return V ;
}

function keydownfunc()
{
  if(shotflag == - 1) 
  {
    shotflag = 1 ;
    power() ;
  }
  else if(shotflag > 1)
  {
    [ballpara[0][2] , ballpara[0][3]]  = svect([ballpara[0][2] , ballpara[0][3]] , shotflag * 10) ;
    mainlp(ballpara , 1) ;
  }
}

function power()
{
  if(shotflag != 0)
  {
    shotflag = shotflag % 100 + 1 ;
    setTimeout(power , 20) ;
    shotfunc();
  }
}

function rot(r)
{
  if(shotflag == - 1)
  {
    let V = [ballpara[0][2] , ballpara[0][3]] ;
    let flag = innerpro(V , V);
    if(flag == 0)
    {
      V = [-1 , 0] ;
    }
    //Mはrラジアンの回転行列
    let M = [[Math.cos(r) , -1 * Math.sin(r)] , [Math.sin(r) , Math.cos(r)]] ; 
    [ballpara[0][2] , ballpara[0][3]] = matrpro(M , V) ;
  }
  shotfunc() ;
}

function shotfunc()//ショットの描画
{
  const radius = 10 ; //ボールの半径
  const ballcoler = ["white" , "yellow" , "blue" , "green" , "red" , "purple" , "black" , "orange" , "gray" , "brown"] ;

//描画準備
  let obj = document.getElementById("shotdrow").getContext("2d") ;
  obj.clearRect(0, 0, 300, 100);
  
//方向の棒
  obj.beginPath () ;
  obj.moveTo(50 , 40) ;
  obj.lineTo(50 + 30 * ballpara[0][2] , 40 + 30 * ballpara[0][3]) ;
  obj.strokeStyle = "black" ;
  obj.lineWidth = 3 ;
  obj.stroke() ;
  obj.closePath() ;
  
//ボール描画
  obj.beginPath() ;
  obj.arc(50 , 40 , radius , 0 , 2 * Math.PI , true ) ;
  obj.fillStyle = "white" ;
  obj.fill() ;
  obj.strokeStyle = "black" ;
  obj.lineWidth = 1 ;
  obj.stroke() ;
  obj.closePath() ;

//残りボールの描画
  for(let i = 0 ; i < 9 ; i++)
  {
    if(remainflag[i + 1] == 1)
    {
      obj.beginPath() ;
      obj.arc(10 * (2 * i + 1) , 90 , radius , 0 , 2 * Math.PI , true ) ;
      obj.fillStyle = ballcoler[i + 1] ;
      obj.fill() ;
      obj.closePath() ;
    }
  }

//ショットの強さバー描画
  obj.beginPath() ;
  obj.fillStyle = "black" ;
  obj.rect(150 , 10 , shotflag , 20) ;
  obj.fill() ;
  obj.closePath() ;

//バーのゲージ目安
  obj.beginPath() ;
  obj.fillStyle = "red" ;
  obj.moveTo(150 , 70) ;
  obj.lineTo(150 + 100 , 70) ;
  obj.lineTo(150 + 100 , 70 - 20) ;
  obj.fill() ;
  obj.closePath() ;

}