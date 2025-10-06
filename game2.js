const canvas = document.getElementById("gameCanvas");  // HTMLからID "gameCanvas" を持つCanvas要素を取得します。
const ctx = canvas.getContext("2d"); // Canvas要素から2D描画コンテキストを取得します。これを使って図形や画像をCanvasに描画します。

// プレイヤー画像の読み込みとアニメーション設定
const playerimg = new Image(); // プレイヤー画像オブジェクトを作成します。
const playerimages = ["Image/player.png", "Image/player2.png"]; // プレイヤーのアニメーション用画像パスを配列で定義します。
playerimg.src = playerimages[0]; // 最初のプレイヤー画像を初期画像として設定します。
let animationTimer = 0; // プレイヤーのアニメーション間隔を制御するタイマーです。
let playerImageIndex = 0; // 現在表示されているプレイヤー画像のアニメーションインデックスです。

// その他の画像の読み込み
const backgorundimg = new Image(); // 背景画像オブジェクトを作成します。
backgorundimg.src = "Image/background.png"; // 背景画像のパスを設定します。
const obstacleimg = new Image(); // 障害物画像オブジェクトを作成します。
obstacleimg.src = "Image/couple.png"; // 障害物（カップル）画像のパスを設定します。
const platformimg = new Image(); // 地面の画像
platformimg.src = "Image/platform.png";

// トンビ（敵）画像の読み込みとアニメーション設定
const enemyimgLeft = new Image(); // 左向きのトンビ画像オブジェクトを作成します。
const enemyimagesLeft = ["Image/enemy.png", "Image/enemy2.png"]; // 左向きトンビのアニメーション用画像パスを配列で定義します。
enemyimgLeft.src = "Image/enemy.png"; // 最初の左向きトンビ画像を初期画像として設定します。

const enemyimgRight = new Image(); // 右向きのトンビ画像オブジェクトを作成します。
const enemyimagesRight = ["Image/enemy_right.png", "Image/enemy_right2.png"]; // 右向きトンビのアニメーション用画像パスを配列で定義します。
enemyimgRight.src = "Image/enemy_right.png"; // 最初の右向きトンビ画像を初期画像として設定します。

// すべての敵画像を一度に読み込み、配列に格納します。
// これにより、アニメーション時に画像を再読み込みすることなく効率的に切り替えられます。
const loadedEnemyImagesLeft = enemyimagesLeft.map(src => {
  const img = new Image();
  img.src = src;
  return img;
});
const loadedEnemyImagesRight = enemyimagesRight.map(src => {
  const img = new Image();
  img.src = src;
  return img;
});

let enemyanimationTimer = 0; // 敵のアニメーション間隔を制御するタイマーです。
let enemyImageIndex = 0; // 現在表示されている敵画像のアニメーションインデックスです。

// 効果音オブジェクトの作成
const jumpSoundPool = [
  new Audio("Sounds/8bitジャンプ.mp3"),
]; 
let currentJumpSoundIndex = 0; // 次に使うジャンプ音のインデックス

const stompSoundPool = [
  new Audio("Sounds/8bitダメージ9.mp3"),
];
let currentStompSoundIndex = 0; // 次に使う踏みつけ/ダメージ音のインデックス

const seGoal = new Audio("Sounds/8bit勝利1.mp3"); // ゴール時の効果音
const seDie = new Audio("Sounds/8bit失敗3.mp3"); // ゲームオーバー時の効果音
const seGet = new Audio("Sounds/8bit獲得8.mp3"); // コイン獲得時の効果音

// ★追加ここから★
const hinaImage = new Image();
hinaImage.src = "Image/ひな.png"; // ヒナ画像のパスを正確に指定してください
// ★追加ここまで★

// BGMの設定（ループ再生と音量）
const bgm = new Audio("Sounds/のどかなみどり.mp3"); // BGMのオーディオオブジェクトを作成します。
bgm.loop = true; // BGMをループ再生に設定します。
bgm.volume = 0.5; // BGMの音量を0.5（半分の音量）に設定します。

// 効果音再生用の関数定義
function onJump() {
    const audio = jumpSoundPool[currentJumpSoundIndex];
    audio.currentTime = 0; // 効果音の再生位置を先頭に戻します。
    audio.play(); // ジャンプ効果音を再生します。
    currentJumpSoundIndex = (currentJumpSoundIndex + 1) % jumpSoundPool.length; // 次のインデックスへ
}

function onStomp() {
    const audio = stompSoundPool[currentStompSoundIndex];
    audio.currentTime = 0;
    audio.play(); // 踏みつけ/ダメージ効果音を再生します。
    currentStompSoundIndex = (currentStompSoundIndex + 1) % stompSoundPool.length; // 次のインデックスへ
}

function onGoal() {
  seGoal.currentTime = 0;
  seGoal.play(); // ゴール効果音を再生します。
}

function onDie() {
  seDie.currentTime = 0;
  seDie.play(); // ゲームオーバー効果音を再生します。
}

function onGet() {
  seGet.currentTime = 0;
  seGet.play(); // コイン獲得効果音を再生します。
}

function drawBackground() {
  ctx.drawImage(backgorundimg, 0, 0, 1000, 600); // 背景画像全体をCanvasに描画します。
  ctx.fillStyle = "#FFFFFF"; // 雲の色を白に設定します。
  // 雲の位置とサイズを定義します。
  const clouds = [{ x: 150, y: 50 }, { x: 500, y: 80 }, { x: 850, y: 60 }, { x: 1200, y: 70 }, { x: 1500, y: 50 }];
  for (let cloud of clouds) {
    // カメラの動きの30%の速さで雲をスクロールさせ、遠近感を表現します。
    let cloudX = cloud.x - (gameState.camera.x * 0.3);
    ctx.beginPath(); // 新しいパスを開始します。
    ctx.arc(cloudX, cloud.y, 15, 0, Math.PI * 2); // 小さな円を描きます。
    ctx.arc(cloudX + 15, cloud.y, 20, 0, Math.PI * 2); // 少し大きな円を描きます。
    ctx.arc(cloudX + 35, cloud.y, 15, 0, Math.PI * 2); // 別の小さな円を描きます。
    ctx.arc(cloudX + 25, cloud.y - 10, 12, 0, Math.PI * 2); // 上部に小さな円を描き、雲の形を作ります。
    ctx.fill(); // 現在のパスを塗りつぶします。
  }
}

// ゲームの状態を管理するオブジェクト
let gameState = {
  score: 0, // スコア
  lives: 3, // ライフ数
  coins: 0, // コイン数
  camera: { x: 0, y: 0 }, // カメラの位置（プレイヤーを追尾）
  gameOver: false, // ゲームオーバーフラグ
  gameWon: false, // ゲームクリアフラグ
  startTime: 0, // ゲーム開始時刻
  elapsedTime: 0, // 経過時間
  stompedEnemies: 0, // 踏みつけた敵の数
  gameStarted: false, // ゲームが開始されたかどうかのフラグ
};

// プレイヤーの状態を管理するオブジェクト
const player = {
  x: 100, y: 300, // 初期位置
  width: 50, height: 50, // 幅と高さ
  velX: 0, velY: 0, // X方向、Y方向の速度
  speed: 3, // 移動速度
  jumpPower: 12, // ジャンプ力
  onGround: false, // 地面にいるかどうかのフラグ
  invulnerable: 0, // 無敵時間（ダメージを受けた後の点滅用）
};

const keys = {}; // 押されているキーの状態を保存するオブジェクト
let platforms = []; // プラットフォーム（足場）の配列
let obstacles = []; // 障害物の配列
let enemies = []; // 敵の配列
let coins = []; // コインの配列
const goal = { x: 2390, y: 250, width: 120, height: 120 }; // ゴールの位置とサイズ

let particles = []; // パーティクル（紙吹雪など）の配列

document.addEventListener("keydown", (e) => {
  // ゲームオーバーまたはゲームクリア時に'R'キーでリスタート
  if ((e.key === "r" || e.key === "R") && (gameState.gameOver || gameState.gameWon)) {
    restartGame(); // ゲームをリスタートする関数を呼び出します。
    return; // 処理を終了します。
  }
  // 'Enter'キーでスタート画面や操作説明画面を切り替える
  if (e.key === "Enter") {
    const startScreen = document.getElementById("startScreen"); // スタート画面の要素を取得
    const instructionScreen = document.getElementById("instructionScreen"); // 操作説明画面の要素を取得
    if (window.getComputedStyle(startScreen).display !== "none") { // スタート画面が表示されている場合
      startScreen.style.display = "none"; // スタート画面を非表示に
      instructionScreen.style.display = "block"; // 操作説明画面を表示
      return;
    }
    if (window.getComputedStyle(instructionScreen).display !== "none") { // 操作説明画面が表示されている場合
      instructionScreen.style.display = "none"; // 操作説明画面を非表示に
      startGame(); // ゲームを開始する関数を呼び出します。
      return;
    }
  }
  // ゲームが開始されており、ゲームオーバーでもゲームクリアでもない場合のみキー入力を受け付ける
  if (gameState.gameStarted && !gameState.gameOver && !gameState.gameWon) {
    keys[e.key] = true; // 押されたキーを`keys`オブジェクトに記録します。
    if (e.key === "ArrowLeft") playerLeft(); // 左矢印キーでプレイヤー画像を左向きに
    else if (e.key === "ArrowRight") playerRight(); // 右矢印キーでプレイヤー画像を右向きに
  }
});

// キーが離された時に`keys`オブジェクトから削除します。
document.addEventListener("keyup", (e) => { keys[e.key] = false; });

// プレイヤー画像を左向きに設定する関数
function playerLeft() {
  playerimages[0] = "Image/player_left.png";
  playerimages[1] = "Image/player_left2.png";
}

// プレイヤー画像を右向きに設定する関数
function playerRight() {
  playerimages[0] = "Image/player.png";
  playerimages[1] = "Image/player2.png";
}

function startGame() {
  document.getElementById("hud").style.display = "block"; // HUD（情報表示）を表示します。
  gameState.gameStarted = true; // ゲーム開始フラグをtrueにします。
  restartGame(); // ゲームをリスタートする関数を呼び出し、初期化します。
}

function restartGame() {
  // ゲームの状態を初期値にリセットします。startTimeは現在時刻に設定。
  gameState = {
    ...gameState, score: 0, lives: 3, coins: 0, camera: { x: 0, y: 0 },
    gameOver: false, gameWon: false, startTime: Date.now(),
    elapsedTime: 0, stompedEnemies: 0,
  };
  if (bgm.paused) { // BGMが停止している場合のみ再生します。
    bgm.currentTime = 0; // BGMの再生位置を先頭に戻します。
    bgm.play(); // BGMを再生します。
  }
  // プレイヤーの状態を初期値にリセットします。
  player.x = 100; player.y = 300; player.velX = 0; player.velY = 0; player.invulnerable = 0;

  // プラットフォーム、障害物、敵、コインの初期配置を設定します。
  platforms = [
    { x: 0, y: 370, width: 4000, height: 30 },
    // 最初のカップル(x:400)と2番目のカップル(x:1050)の間
    {x: 800, y: 250, width: 120, height: 30}, // 2番目のカップルの手前

    // 2番目のカップル(x:1050)と3番目のカップル(x:1700)の間
    {x: 1450, y: 270, width: 80, height: 30},

    // 3番目のカップル(x:1700)と4番目のカップル(x:2350)の間
    {x: 2100, y: 230, width: 120, height: 30},

    // 4番目のカップル(x:2350)と5番目のカップル(x:3000)の間
    {x: 2750, y: 260, width: 110, height: 30},

    // 5番目のカップル(x:3000)と6番目のカップル(x:3650)の間
    {x: 3400, y: 240, width: 100, height: 30},

    // ゴール地点の足場をさらに延長
        // 幅を 300 から 400 に増やします（必要に応じてさらに調整してください）
        { x: 3800, y: 370, width: 400, height: 30 }, // 幅を延長
        // ★変更ここまで★
  ];

  obstacles = [
    { x: 400, y: 260, width: 140, height: 140 },
    { x: 1050, y: 260, width: 140, height: 140 },
    { x: 1700, y: 260, width: 140, height: 140 },
    { x: 2350, y: 260, width: 140, height: 140 },
    { x: 3000, y: 260, width: 140, height: 140 },
    { x: 3650, y: 260, width: 140, height: 140 }
  ];

 const ENEMY_WIDTH = 70;
    const OBSTACLE_WIDTH = 140;
    const PATROL_HORIZONTAL_SPEED = 1; // 横移動専用トンビの速度

enemies = [
    // 1組目のカップル（x:400）と2組目のカップル（x:1050）の間
    {
        x: 725, y: 230, width: ENEMY_WIDTH, height: ENEMY_WIDTH,
        velX: 0, velY: 0, animationTimer: 0, imageIndex: 0, state: "alive", type: "chaser",
        minX: 400 + OBSTACLE_WIDTH, maxX: 1050 - ENEMY_WIDTH, // 追跡範囲
        chaseSpeed: 0.8, // 追跡速度を1.5に設定（以前の0.5から増加）
        idlePatrolSpeed: 0.5, // 待機時の巡回速度
        currentIdleDirection: 1, // 待機時の初期進行方向 (1:右, -1:左)
        mode: "idle", // 初期モードは待機
        minY: 100, maxY: 300 // Y軸方向の巡回範囲（chaserでは主に開始位置の調整用）
    },
    // 2組目のカップル（x:1050）と3組目のカップル（x:1700）の間
    {
        x: 1375, y: 230, width: ENEMY_WIDTH, height: ENEMY_WIDTH,
        velX: 0, velY: 0, animationTimer: 0, imageIndex: 0, state: "alive", type: "chaser",
        minX: 1050 + OBSTACLE_WIDTH, maxX: 1700 - ENEMY_WIDTH,
        chaseSpeed: 0.8,
        idlePatrolSpeed: 0.5,
        currentIdleDirection: -1, // こちらは左から開始
        mode: "idle",
        minY: 100, maxY: 300
    },
    // 3組目のカップル（x:1700）と4組目のカップル（x:2350）の間
    {
        x: 2025, y: 230, width: ENEMY_WIDTH, height: ENEMY_WIDTH,
        velX: 0, velY: 0, animationTimer: 0, imageIndex: 0, state: "alive", type: "chaser",
        minX: 1700 + OBSTACLE_WIDTH, maxX: 2350 - ENEMY_WIDTH,
        chaseSpeed: 0.8,
        idlePatrolSpeed: 0.5,
        currentIdleDirection: 1,
        mode: "idle",
        minY: 100, maxY: 300
    },
    // 4組目のカップル（x:2350）と5組目のカップル（x:3000）の間
    {
        x: 2675, y: 230, width: ENEMY_WIDTH, height: ENEMY_WIDTH,
        velX: 0, velY: 0, animationTimer: 0, imageIndex: 0, state: "alive", type: "chaser",
        minX: 2350 + OBSTACLE_WIDTH, maxX: 3000 - ENEMY_WIDTH,
        chaseSpeed: 0.8,
        idlePatrolSpeed: 0.5,
        currentIdleDirection: -1,
        mode: "idle",
        minY: 100, maxY: 300
    },
    // 5組目のカップル（x:3000）と6組目のカップル（x:3650）の間
    {
        x: 3325, y: 230, width: ENEMY_WIDTH, height: ENEMY_WIDTH,
        velX: 0, velY: 0, animationTimer: 0, imageIndex: 0, state: "alive", type: "chaser",
        minX: 3000 + OBSTACLE_WIDTH, maxX: 3650 - ENEMY_WIDTH,
        chaseSpeed: 0.8,
        idlePatrolSpeed: 0.5,
        currentIdleDirection: 1,
        mode: "idle",
        minY: 100, maxY: 300
    }
];
  
  coins = [
      // 最初の地面上の比較的取りやすい位置
    { x: 300, y: 340, width: 16, height: 16, collected: false },

    // 追加した足場1 (x: 600, y: 300) の上
    { x: 620, y: 270, width: 16, height: 16, collected: false },

    // 追加した足場2 (x: 800, y: 250) の上
    { x: 830, y: 220, width: 16, height: 16, collected: false },

    // 追跡するトンビが邪魔をするような位置
    { x: 1300, y: 230, width: 16, height: 16, collected: false },

    // 少し高いジャンプが必要な位置
    { x: 1900, y: 200, width: 16, height: 16, collected: false },
    { x: 2000, y: 200, width: 16, height: 16, collected: false },

    // 追跡トンビと絡む位置
    { x: 2650, y: 250, width: 16, height: 16, collected: false },

    // ゴール手前のボーナス的な位置
    { x: 3800, y: 340, width: 16, height: 16, collected: false },
    { x: 3850, y: 340, width: 16, height: 16, collected: false }
  ];

  goal.x = 3900; // ゴールのX座標を設定します。
  goal.y = 250; // ゴールのY座標を設定します。

  particles = []; // パーティクルをクリアします。

  const gameOverScreen = document.getElementById("gameOver"); // ゲームオーバー画面の要素を取得します。
  gameOverScreen.style.display = "none"; // ゲームオーバー画面を非表示にします。
  gameOverScreen.innerHTML = ""; // ゲームオーバー画面の内容をクリアします。
  document.getElementById("hud").style.display = "block"; // HUDを再表示します。
  updateUI(); // UIを更新します。
}

function updatePlayer() {
  if (player.invulnerable > 0) player.invulnerable--; // 無敵時間を減らします。
  // 左右キー入力に応じたプレイヤーの水平方向の速度を設定します。
  if (keys["ArrowLeft"]) player.velX = -player.speed;
  else if (keys["ArrowRight"]) player.velX = player.speed;
  else player.velX *= 0.8; // キーが押されていない場合、徐々に減速させます。

  // スペースキーが押され、かつプレイヤーが地面にいる場合、ジャンプします。
  if (keys[" "] && player.onGround) {
    player.velY = -player.jumpPower; // 上向きの速度を設定します。
    player.onGround = false; // 地面から離れた状態にします。
    onJump(); // ジャンプ効果音を再生します。
  }

  // 重力の影響を適用します。落下中は加速が大きくなります。
  player.velY += (player.velY >= 0) ? 0.08 : 0.5;
  player.x += player.velX; // プレイヤーのX座標を更新します。
  player.y += player.velY; // プレイヤーのY座標を更新します。
  player.onGround = false; // デフォルトで地面にいない状態に設定し、衝突判定で更新します。

  //プレイヤーが画面左端を超えないように制限
  if (player.x < 0) {
    player.x = 0;
    player.velX = 0; // 左端に衝突したら水平方向の速度を0にする。
  }

  // プラットフォームとの衝突判定
  for (let p of platforms) {
    // プレイヤーとプラットフォームが衝突しているかチェック
    if (player.x < p.x + p.width && player.x + player.width > p.x && player.y < p.y + p.height && player.y + player.height > p.y) {
      if (player.velY > 0 && player.y < p.y) {
        // 下向きに移動していてプラットフォームの上にいる場合（着地）
        player.y = p.y - player.height; // プレイヤーをプラットフォームの表面に合わせます。
        player.velY = 0; // Y方向の速度を0にします。
        player.onGround = true; // 地面にいる状態にします。
      } else if (player.velY < 0 && player.y > p.y) {
        // 上向きに移動していてプラットフォームの下面に衝突した場合
        player.y = p.y + p.height; // プレイヤーをプラットフォームの下面に合わせます。
        player.velY = 0; // Y方向の速度を0にします。
      } else if (player.velX > 0) {
        // 右向きに移動していてプラットフォームの左側に衝突した場合
        player.x = p.x - player.width; // プレイヤーをプラットフォームの左側に合わせます。
        player.velX = 0; // X方向の速度を0にします。
      } else if (player.velX < 0) {
        // 左向きに移動していてプラットフォームの右側に衝突した場合
        player.x = p.x + p.width; // プレイヤーをプラットフォームの右側に合わせます。
        player.velX = 0; // X方向の速度を0にします。
      }
    }
  }
  if (player.y > canvas.height) playerDie(); // プレイヤーが画面の下に落ちたら死亡処理
  gameState.camera.x = player.x - canvas.width / 3; // カメラのX座標をプレイヤーの少し右に設定（プレイヤーが画面の1/3のところに表示されるように）
  if (gameState.camera.x < 0) gameState.camera.x = 0; // カメラがCanvasの左端を超えないように制限します。
}

// 各オブジェクトの衝突判定用の円の情報を取得する関数
function getCollisionCircle(obj) {
  let cx = obj.x + obj.width / 2; // オブジェクトの中心X座標
  let cy = obj.y + obj.height / 2; // オブジェクトの中心Y座標
  let radius; // 半径

  switch (obj.width) {
    case 50: // プレイヤー (width: 50)
      radius = 22; // 半径を調整
      break;
    case 70: // トンビ (width: 70)
      radius = 30; // 半径を調整
      break;
    case 140: // カップル (width: 140)
      cy = obj.y + obj.height * 0.6; // Y座標を足元に調整
      radius = 35; // 半径をさらに小さく調整
      break;
    case 16: // コイン (width: 16)
      radius = 8; // 半径を調整
      break;
    default:
      radius = (obj.width + obj.height) / 4; // デフォルトの半径計算
  }
  return { cx, cy, radius }; // 中心座標と半径を返します。
}

// 2つのオブジェクトが衝突しているかチェックする関数（円形衝突判定）
function checkCollision(obj1, obj2) {
  const circle1 = getCollisionCircle(obj1); // オブジェクト1の衝突判定用円を取得
  const circle2 = getCollisionCircle(obj2); // オブジェクト2の衝突判定用円を取得

  const dx = circle1.cx - circle2.cx; // 中心X座標の差
  const dy = circle1.cy - circle2.cy; // 中心Y座標の差
  const distanceSq = dx * dx + dy * dy; // 中心間の距離の2乗

  const sumOfRadii = circle1.radius + circle2.radius; // 半径の合計
  const sumOfRadiiSq = sumOfRadii * sumOfRadii; // 半径の合計の2乗

  return distanceSq < sumOfRadiiSq; // 距離の2乗が半径の合計の2乗より小さければ衝突と判定
}

function updateObstacles() {
  for (let o of obstacles) {
    if (checkCollision(player, o)) { // プレイヤーと障害物が衝突した場合
      if (player.invulnerable === 0) playerDie(); // 無敵時間でなければプレイヤー死亡処理
    }
  }
}

// updateEnemies関数
function updateEnemies() {
    const playerAbsoluteX = player.x;
    const playerAbsoluteY = player.y; // プレイヤーの絶対Y座標を直接使用

    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];

        if (e.state === "alive") {
            if (e.type === "chaser") {
                const playerIsInArea = playerAbsoluteX >= e.minX && playerAbsoluteX <= e.maxX + e.width;

                if (playerIsInArea) {
                    e.mode = "chasing";
                } else if (e.mode === "chasing" && !playerIsInArea) {
                    e.mode = "idle";
                    e.velX = 0;
                    e.velY = 0;
                }

                if (e.mode === "chasing") {
                    // ★変更ここから★
                    // 目標Y座標をプレイヤーのY座標に直接設定
                    const dy = playerAbsoluteY - e.y;
                    // ★変更ここまで★
                    const dx = playerAbsoluteX - e.x;

                    // Y軸方向の追跡（上下）
                    if (dy > 10) { // プレイヤーが下なら下降
                        e.velY = e.chaseSpeed;
                    } else if (dy < -10) { // プレイヤーが上なら上昇
                        e.velY = -e.chaseSpeed;
                    } else { // プレイヤーのY座標に近い場合はY速度を徐々に減速
                        e.velY *= 0.9;
                        if (Math.abs(e.velY) < 0.1) e.velY = 0;
                    }

                    // X軸方向の追跡（左右）
                    if (dx > 0) {
                        e.velX = e.chaseSpeed;
                    } else if (dx < 0) {
                        e.velX = -e.chaseSpeed;
                    }

                    // X軸の追跡範囲制限
                    if (e.x + e.velX < e.minX) {
                        e.x = e.minX;
                        e.velX = 0;
                    } else if (e.x + e.width + e.velX > e.maxX) {
                        e.x = e.maxX - e.width;
                        e.velX = 0;
                    }

                } else { // 待機モード ("idle")
                    e.velY = 0;

                    e.velX = e.idlePatrolSpeed * e.currentIdleDirection;

                    if (e.x + e.velX < e.minX) {
                        e.x = e.minX;
                        e.currentIdleDirection *= -1;
                        e.velX = e.idlePatrolSpeed * e.currentIdleDirection;
                    } else if (e.x + e.width + e.velX > e.maxX) {
                        e.x = e.maxX - e.width;
                        e.currentIdleDirection *= -1;
                        e.velX = e.idlePatrolSpeed * e.currentIdleDirection;
                    }
                }

                e.x += e.velX;
                e.y += e.velY;

            }

            if (checkCollision(player, e)) {
                const isStomp = player.velY > 0 && (player.y + player.height * 0.8) < e.y + e.height / 2;

                if (isStomp) {
                    e.state = "falling";
                    e.fallSpeed = 0;
                    player.velY = -8;
                    gameState.stompedEnemies++;
                    onStomp();
                } else if (player.invulnerable === 0) {
                    playerDie();
                }
            }
        }
        else if (e.state === "falling") {
            e.fallSpeed += 0.5;
            e.y += e.fallSpeed;

            if (e.y > canvas.height + 100) {
                enemies.splice(i, 1);
            }
        }
    }
}

function updateCoins() {
  for (let c of coins) {
    if (!c.collected && checkCollision(player, c)) { // コインが未収集で、プレイヤーと衝突した場合
      c.collected = true; // コインを収集済みに設定します。
      gameState.coins++; // コイン数をカウントアップします。
      onGet(); // コイン獲得効果音を再生します。
    }
  }
}

function checkGoal() {
  // プレイヤーがゴール範囲内にいるかチェック
  if (player.x < goal.x + goal.width && player.x + player.width > goal.x && player.y < goal.y + goal.height && player.y + player.height > goal.y) {
    if (gameState.gameWon) return; // すでにゲームクリアしていれば何もしません。
    gameState.gameWon = true; // ゲームクリアフラグをtrueに設定します。
    bgm.pause(); // BGMを停止します。
    onGoal(); // ゴール効果音を再生します。

    createConfetti(goal.x + goal.width / 2, goal.y); // ゴール位置で紙吹雪を生成します。

    document.getElementById("hud").style.display = "none"; // HUDを非表示にします。
    // スコア計算
    const timeBonus = Math.max(0, 3000 - gameState.elapsedTime * 100); // 時間ボーナス（短いほど高得点）
    const coinBonus = gameState.coins * 200; // コインボーナス
    const enemyBonus = gameState.stompedEnemies * 100; // 敵撃破ボーナス
    gameState.score = timeBonus + coinBonus + enemyBonus; // 合計スコアを計算します。

    // スコアに応じたランク付け
    let rank = { name: "初心者🔰", color: "#6c757d" }; // デフォルトのランク
    if (gameState.score >= 3000) {
      rank = { name: "達人🦆✨", color: "#ffc107" }; // 達人ランク
    } else if (gameState.score >= 2500) {
      rank = { name: "上級者", color: "#dc3545" }; // 上級者ランク
    } else if (gameState.score >= 2000) {
      rank = { name: "中級者", color: "#0d6efd" }; // 中級者ランク
    }

    // ゲームオーバー/クリア画面に結果を表示します。
    const gameOverScreen = document.getElementById("gameOver");
    gameOverScreen.innerHTML = `<div style="background-color:rgba(0,0,0,0.95);color:#fff;padding:20px;border-radius:15px;border:5px solid ${rank.color};text-align:center;width:300px;font-family:'Courier New', monospace;box-shadow:0 0 25px rgba(0,0,0,0.5);"><h2 style="font-size:2em;color:${rank.color};margin-top:0;margin-bottom:10px;border-bottom:2px solid ${rank.color};padding-bottom:5px;text-shadow:1px 1px 2px rgba(0,0,0,0.5);">${rank.name}</h2><div style="text-align:left;margin:15px auto;width:90%;font-size:1em;"><p><strong>タイムボーナス:</strong><span style="float:right;">${timeBonus}</span></p><p><strong>コインボーナス:</strong><span style="float:right;">${coinBonus}</span></p><p><strong>撃破ボーナス:</strong><span style="float:right;">${enemyBonus}</span></p></div><hr style="border:1px dashed #ccc;margin:10px 0;"><div style="font-size:1.2em;font-weight:bold;margin:10px 0;">合計スコア: ${gameState.score}</div><p style="font-size:0.8em;color:#ccc;">Rキーでリスタート</p></div>`;
    gameOverScreen.style.display = "block"; // ゲームオーバー画面を表示します。
  }
}

function playerDie() {
  if (player.invulnerable > 0) return; // 無敵時間中であれば死亡処理をスキップします。
  gameState.lives--; // ライフを1減らします。
  player.invulnerable = 120; // 120フレーム（約2秒）の無敵時間を設定します。
  if (gameState.lives <= 0) { // ライフが0以下になった場合
    gameState.gameOver = true; // ゲームオーバーフラグをtrueに設定します。
    bgm.pause(); // BGMを停止します。
    onDie(); // ゲームオーバー効果音を再生します。
    document.getElementById("hud").style.display = "none"; // HUDを非表示にします。
    const gameOverScreen = document.getElementById("gameOver"); // ゲームオーバー画面の要素を取得します。
    const failColor = "#a94442"; // 失敗時の色を設定します。

    // ゲームオーバー画面の内容を設定します。
    gameOverScreen.innerHTML = `
      <div style="background-color:rgba(0,0,0,0.9);color:#fff;padding:40px 20px;border-radius:15px;border:5px solid ${failColor};text-align:center;width:300px;font-family:'Courier New', monospace;box-shadow:0 0 25px rgba(0,0,0,0.5);">
        <h2 style="font-size:2.5em;color:${failColor};margin-top:0;margin-bottom:20px;text-shadow:1px 1px 2px rgba(0,0,0,0.5);">GAME OVER</h2>
        <p style="font-size:1em;margin-bottom:30px;">また挑戦してね！</p>
        <p style="font-size:0.9em;color:#ccc;">Rキーでリスタート</p>
      </div>`;

    gameOverScreen.style.display = "block"; // ゲームオーバー画面を表示します。
  } else { // ライフが残っている場合：ライフ数を維持しつつ、ゲームの状態をリセット
    const currentLives = gameState.lives; // 現在のライフを一時保存
    restartGame(); // すべてのゲーム要素をリセット
    gameState.lives = currentLives; // 保存したライフ数を戻す
    // 無敵時間を指定（restartGame()でも設定されるが念のため）
    player.invulnerable = 120;
    onStomp(); // ダメージ効果音を再生します。
  }
  updateUI(); // ライフの変更をHUDに反映
}

function drawPlayer() {
  ctx.save(); // 現在の描画状態を保存します。
  // デバッグ用にプレイヤーのヒットボックスを赤く描画（透明度0なので見えない）
  ctx.globalAlpha = 0; ctx.fillStyle = "#FF0000";
  ctx.fillRect(player.x - gameState.camera.x, player.y, player.width, player.height);
  // 無敵時間中、プレイヤーを点滅させて描画します。
  if (player.invulnerable === 0 || Math.floor(player.invulnerable / 5) % 2 === 0) {
    ctx.globalAlpha = 1; // 透明度を元に戻します。
    ctx.drawImage(playerimg, player.x - gameState.camera.x, player.y, player.width, player.height); // プレイヤー画像を描画します。
  }
  ctx.restore(); // 保存した描画状態を復元します。
}

function drawPlatforms() {
  for (const p of platforms) {
    const tileWidth = platformimg.width;
    // 地面画像の高さから30px引く
    const visibleHeight = Math.max(0, platformimg.height - 90);
    const startX = p.x;
    const endX = p.x + p.width;
    for (let x = startX; x < endX; x += tileWidth) {
      ctx.drawImage(
        platformimg,
        0, 0, // 元画像の左上
        Math.min(tileWidth, endX - x), visibleHeight, // 切り出しサイズ（高さをvisibleHeightに）
        x - gameState.camera.x, p.y, // 描画位置
        Math.min(tileWidth, endX - x), visibleHeight // 描画サイズ（高さもvisibleHeight）
      );
    }
  }
}

function drawObstacles() {
  for (let o of obstacles) { ctx.drawImage(obstacleimg, o.x - gameState.camera.x, o.y, o.width, o.height); } // 障害物画像を描画します。
}

// 敵（トンビ）の左向きアニメーションを制御する関数
function enemyLeftAnimation() {
  enemyanimationTimer += 1;
  if (enemyanimationTimer >= 200) { // 一定フレームごとに画像を切り替える
    enemyanimationTimer = 0;
    enemyImageIndex = (enemyImageIndex + 1) % enemyimagesLeft.length; // 画像インデックスを更新
    enemyimgLeft.src = enemyimagesLeft[enemyImageIndex]; // 画像ソースを更新
  }
}

// 敵（トンビ）の右向きアニメーションを制御する関数
function enemyRightAnimation() {
  enemyanimationTimer += 1;
  if (enemyanimationTimer >= 200) {
    enemyanimationTimer = 0;
    enemyImageIndex = (enemyImageIndex + 1) % enemyimagesRight.length;
    enemyimgRight.src = enemyimagesRight[enemyImageIndex];
  }
}

function drawEnemies() {
    for (let e of enemies) {
        if (e.state === "alive") {
            e.animationTimer++;
            if (e.animationTimer >= 60) {
                e.animationTimer = 0;
                e.imageIndex = (e.imageIndex + 1) % 2;
            }

            let img;
            // プレイヤーとトンビのX座標の差を計算
            const dx = player.x - e.x;

            // プレイヤーがトンビの真上（X座標が非常に近い）に来た場合、画像を左向きに固定
            // e.width / 4 は、トンビの横幅の1/4程度を「真上」と判断する閾値。調整可能。
            if (Math.abs(dx) < e.width / 4) {
                img = loadedEnemyImagesLeft[e.imageIndex]; // 左向きの画像を強制的に使用
            } else {
                // プレイヤーが真上にいない場合は、通常の追跡方向に応じて画像を切り替える
                img = e.velX >= 0 ? loadedEnemyImagesRight[e.imageIndex] : loadedEnemyImagesLeft[e.imageIndex];
            }

            ctx.drawImage(img, e.x - gameState.camera.x, e.y, e.width, e.height);

        } else if (e.state === "falling") {
            ctx.save();
            ctx.translate(e.x - gameState.camera.x + e.width / 2, e.y + e.height / 2);
            ctx.rotate(Math.PI / 2);
            ctx.drawImage(loadedEnemyImagesLeft[0], -e.width / 2, -e.height / 2, e.width, e.height);
            ctx.restore();
        }
    }
}

function drawCoins() {
  ctx.fillStyle = "#FFD700"; // コインの色を金色に設定
  for (let c of coins) {
    if (!c.collected) { // コインが未収集の場合のみ描画
      ctx.beginPath();
      ctx.arc(c.x - gameState.camera.x + c.width / 2, c.y + c.height / 2, c.width / 2, 0, Math.PI * 2); // 外側の円を描画
      ctx.fill();
      ctx.fillStyle = "#FFA500"; // 中央の色をオレンジに設定
      ctx.beginPath();
      ctx.arc(c.x - gameState.camera.x + c.width / 2, c.y + c.height / 2, c.width / 3, 0, Math.PI * 2); // 内側の円を描画
      ctx.fill();
      ctx.fillStyle = "#FFD700"; // 色を元に戻す
    }
  }
}

function drawGoal() {
    const gateX = goal.x - gameState.camera.x; // カメラ位置を考慮したゴールのX座標
    const bottomY = 370; // 地面のY座標（プラットフォームの高さ）

    // 鳥居の各部の色を定義
    const mainRed = "#e74c3c";
    const shadowRed = "#c0392b";
    const blackDetail = "#2c3e50";
    const blackBase = "#34495e";

    // 鳥居の各部のサイズを定義
    const pillarWidth = 16; // 柱の幅
    const kasagiHeight = 14; // 笠木（最上部の水平材）の高さ
    const shimakiHeight = 10; // 島木（笠木の下の水平材）の高さ
    const nukiHeight = 10; // 貫（柱を貫く水平材）の高さ
    const toriiHeight = 150; // 鳥居全体の高さ（適宜調整）

    // 土台を長くするための新しい変数
    const originalGateWidth = 100; // 元の鳥居の横幅
    const extendedBaseWidth = 150; // 拡張する土台の新しい幅（調整してください）
    const baseHeight = 30; // 土台の高さ（適宜調整）
    const baseOffsetFromGround = 0; // 地面からのオフセット

    // ★ヒナ画像のサイズと間隔の変更ここから★
    const hinaWidth = 50; // ヒナの表示幅を大きく（例: 40 -> 50）
    const hinaHeight = 50; // ヒナの表示高さを大きく（例: 40 -> 50）
    const hinaSpacing = 5; // ヒナ同士の間隔を詰める（例: 10 -> 5）
    // ★ヒナ画像のサイズと間隔の変更ここまで★

    const numHina = 3; // ヒナの数
    const totalHinaGroupWidth = (hinaWidth * numHina) + (hinaSpacing * (numHina - 1)); // 3匹分の合計幅と間隔

    // 土台の描画位置を計算（鳥居の中心に配置されるように調整）
    const baseDrawX = gateX + originalGateWidth / 2 - extendedBaseWidth / 2;
    const baseDrawY = bottomY - baseHeight - baseOffsetFromGround;

    // ★土台の描画★
    ctx.fillStyle = blackBase; // 土台の色
    ctx.fillRect(baseDrawX, baseDrawY, extendedBaseWidth, baseHeight);

    // 笠木を描画
    ctx.fillStyle = mainRed;
    ctx.fillRect(gateX - 12, bottomY - toriiHeight + 20, originalGateWidth + 24, kasagiHeight);
    ctx.fillStyle = shadowRed;
    ctx.fillRect(gateX - 12, bottomY - toriiHeight + 20 + kasagiHeight - 4, originalGateWidth + 24, 4);

    // 島木を描画
    ctx.fillStyle = blackDetail;
    ctx.fillRect(gateX - 12, bottomY - toriiHeight + 20 + kasagiHeight, originalGateWidth + 24, shimakiHeight);

    // 柱を描画
    const pillarTopY = bottomY - toriiHeight + 20 + kasagiHeight + shimakiHeight;
    const pillarActualHeight = bottomY - pillarTopY; // 土台の上面まで柱を描画するように調整

    ctx.fillStyle = mainRed;
    ctx.fillRect(gateX + 4, pillarTopY, pillarWidth, pillarActualHeight); // 左の柱
    ctx.fillStyle = shadowRed;
    ctx.fillRect(gateX + 4 + pillarWidth - 4, pillarTopY, 4, pillarActualHeight); // 左の柱の影

    ctx.fillStyle = mainRed;
    ctx.fillRect(gateX + originalGateWidth - pillarWidth - 4, pillarTopY, pillarWidth, pillarActualHeight); // 右の柱
    ctx.fillStyle = shadowRed;
    ctx.fillRect(gateX + originalGateWidth - 4, pillarTopY, 4, pillarActualHeight); // 右の柱の影

    // 貫を描画
    const nukiY = pillarTopY + 30;
    ctx.fillStyle = blackDetail;
    ctx.fillRect(gateX - 5, nukiY, originalGateWidth + 10, nukiHeight);

    // ★ヒナ画像の描画（3匹を鳥居の右側に集合）★
    // ヒナグループの開始X座標を計算
    // 鳥居の右端 (gateX + originalGateWidth) から少しオフセット (例: 10px) して配置
    const groupStartX = gateX + originalGateWidth + 10; // 鳥居のすぐ右に配置

    for (let i = 0; i < numHina; i++) {
        ctx.drawImage(
            hinaImage, // グローバルで定義したhinaImageを使用
            groupStartX + (i * (hinaWidth + hinaSpacing)), // 1匹ずつ間隔を空けて配置
            bottomY - hinaHeight, // 地面 (bottomY) に足元を合わせる
            hinaWidth,
            hinaHeight
        );
    }
}

// 紙吹雪を生成する関数
function createConfetti(x, y) {
  const confettiCount = 100; // 生成する紙吹雪の数
  const colors = ['#f1c40f', '#e74c3c', '#3498db', '#ecf0f1', '#2ecc71']; // 紙吹雪の色
  for (let i = 0; i < confettiCount; i++) {
    particles.push({
      x: x, y: y, // 生成位置
      velX: (Math.random() - 0.5) * 15, // X方向のランダムな初速度
      velY: Math.random() * -20, // Y方向のランダムな初速度（上向き）
      size: Math.random() * 8 + 3, // ランダムなサイズ
      color: colors[Math.floor(Math.random() * colors.length)], // ランダムな色
      life: 150, // 寿命（フレーム数）
      gravity: 0.2 // 重力
    });
  }
}

// パーティクルを更新し、描画する関数
function updateAndDrawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) { // 後ろからループすることで、要素を削除してもインデックスがずれないようにします。
    const p = particles[i];
    p.life--; // 寿命を減らします。
    if (p.life <= 0) { // 寿命が尽きたら
      particles.splice(i, 1); // パーティクルを配列から削除します。
      continue; // 次のパーティクルへ。
    }
    p.velY += p.gravity; // 重力を適用します。
    p.x += p.velX; // X座標を更新します。
    p.y += p.velY; // Y座標を更新します。

    ctx.fillStyle = p.color; // パーティクルの色を設定
    ctx.fillRect(p.x - gameState.camera.x, p.y, p.size, p.size); // パーティクルを描画します。
  }
}

function updateUI() {
  if (!gameState.gameStarted) return; // ゲームが開始されていなければ更新しません。
  document.getElementById("lives").textContent = gameState.lives; // ライフ数を更新
  document.getElementById("coins").textContent = gameState.coins; // コイン数を更新
  document.getElementById("time").textContent = gameState.elapsedTime; // 経過時間を更新
  document.getElementById("stomped").textContent = gameState.stompedEnemies; // 撃破数を更新
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Canvas全体をクリアします。
  drawBackground(); // 背景を描画します。

  if (gameState.gameStarted) { // ゲームが開始されている場合のみ以下の処理を実行
    if (!gameState.gameOver && !gameState.gameWon) { // ゲームオーバーでもゲームクリアでもない場合
      gameState.elapsedTime = Math.floor((Date.now() - gameState.startTime) / 1000); // 経過時間を計算します。
      updatePlayer(); // プレイヤーの状態を更新します。
      updateObstacles(); // 障害物の状態を更新します。
      updateEnemies(); // 敵の状態を更新します。
      updateCoins(); // コインの状態を更新します。
      checkGoal(); // ゴール判定を行います。
    }
    drawPlatforms(); // プラットフォームを描画します。
    drawCoins(); // コインを描画します。
    drawObstacles(); // 障害物を描画します。
    drawEnemies(); // 敵を描画します。

    if (player.velX !== 0) { // プレイヤーが動いている場合、アニメーションを更新
      animationTimer += 1;
      if (animationTimer >= 15) { // 15フレームごとに画像を切り替える（アニメーション速度）
        animationTimer = 0;
        playerImageIndex = (playerImageIndex + 1) % playerimages.length; // 画像インデックスを更新
        playerimg.src = playerimages[playerImageIndex]; // 画像ソースを更新
      }
    } else { // プレイヤーが停止している場合、初期画像に戻す
      playerimg.src = playerimages[0];
      animationTimer = 0;
      playerImageIndex = 0;
    }

    drawPlayer(); // プレイヤーを描画します。
    drawGoal(); // ゴールを描画します。

    updateAndDrawParticles(); // パーティクルを更新し描画します。

    updateUI(); // UIを更新します。
  }
  requestAnimationFrame(gameLoop); // 次のフレームで`gameLoop`関数を再度呼び出します。これによりスムーズなアニメーションが実現します。
}

gameLoop(); // ゲームループを開始します。