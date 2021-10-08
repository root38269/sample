"use strict";

const array = [    //const はデータ自身を変更できないが、その中身だけなら変更できる
	[1,0,0,0],
	[0,1,0,0],
	[0,0,0,0],
	[0,0,0,0],
];
let Status = 'Standby';
let Score = 0;
let Mode = 'Normal';
let StartTime = 0;
let LapTime = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let arrayMaxNum = 0;

const sLeft = 'Left';
const sRight = 'Right';
const sUp = 'Up';
const sDown = 'Down';

const ProportionOf4 = 0.1;


document.addEventListener('keydown', function(event) {
	let keyname = event.key;
	
	if ((keyname == 'ArrowLeft') || (keyname == 'a'))
		MoveLeft();
	else if ((keyname == 'ArrowRight')  || (keyname == 'd'))
		MoveRight();
	else if ((keyname == 'ArrowUp')  || (keyname == 'w'))
		MoveUp();
	else if ((keyname == 'ArrowDown')  || (keyname == 's'))
		MoveDown();
	
});

window.addEventListener('load', NewGameNoMessage);

//==================================スクロール処理==================================

//スクロールを禁止する
document.addEventListener('touchmove', noScroll, { passive: false });
function noScroll(event) {
	event.preventDefault();
}

let touchStartX;
let touchStartY;
let touchMoveX;
let touchMoveY;
let threshold = 40;

// 開始時
window.addEventListener("touchstart", function(event) {
	event.preventDefault();
	// 座標の取得
	touchStartX = event.touches[0].pageX;
	touchStartY = event.touches[0].pageY;
	touchMoveX = touchStartX;
	touchMoveY = touchStartY;
}, false);

// 移動時
window.addEventListener("touchmove", function(event) {
	event.preventDefault();
	// 座標の取得
	touchMoveX = event.changedTouches[0].pageX;
	touchMoveY = event.changedTouches[0].pageY;
}, false);

// 終了時
window.addEventListener("touchend", function(event) {
	// 移動量の判定
	if (Math.abs(touchStartX - touchMoveX) > Math.abs(touchStartY - touchMoveY)) {
		if (touchStartX > (touchMoveX + threshold)) {
			//右から左に指が移動した場合
			MoveLeft();
		}
		if ((touchStartX + threshold) < touchMoveX) {
			//左から右に指が移動した場合
			MoveRight();
		}
	}else{
		if (touchStartY > (touchMoveY + threshold)) {
			//下から上に指が移動した場合
			MoveUp();
		}
		if ((touchStartY + threshold) < touchMoveY) {
			//上から下に指が移動した場合
			MoveDown();
		}
	}
	touchMoveX = 0;
	touchMoveY = 0;
	touchStartX = 0;
	touchStartY = 0;
}, false);


//==================================================================================


//最大値を返す(指数部分)
//Arr 非破壊
function fMaxNum(Arr){
	let i = 0; let j = 0;
	let x = 0;
	
	for (i = 0; i < 4; i++){
		for (j = 0; j < 4; j++){
			if (Arr[i][j] > x)
				x = Arr[i][j];
		}
	}
	return x;
	
}

//初期化する
function NewGameNoMessage(){
	StopAuto();
	let i = 0;
	let j = 0;
	for (i = 0; i < 4; i++){
		for (j = 0; j < 4; j++){
			array[i][j] = 0;
		}
	}
	
	if (Mode == 'Normal'){
		generate24(array);
		generate24(array);
	}else{
		array[0][0] = 1;
		array[2][2] = 1;
	}
	
	Status = 'Standby';
	Score = 0;
	StartTime = 0;
	LapTime = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	
	let S = document.getElementById('time');
	S.innerHTML = 'time:0';
	
	arrayMaxNum = fMaxNum(array);
	
	koushin();
	
}

function NewGame(){
	if (Status == 'Standby'){
		NewGameNoMessage();
	}else{
		if(confirm('今のゲームの状態は破棄されます。\n新しいゲームを始めますか?'))
			NewGameNoMessage();
	}
}

//ゲームオーバーかどうか
//Arr 非破壊
function IsFinished(Arr){
	let i = 0;
	let j = 0;
	const moved = [true];
	const simuArr = [
		[0,0,0,0],
		[0,0,0,0],
		[0,0,0,0],
		[0,0,0,0],
	];
	
	for (i = 0; i < 4; i++){
		for (j = 0; j < 4; j++){
			simuArr[i][j] = Arr[i][j];
		}
	}
	moveB(simuArr, sLeft, moved);
	if (moved[0] == true) return false;
	
	for (i = 0; i < 4; i++){
		for (j = 0; j < 4; j++){
			simuArr[i][j] = Arr[i][j];
		}
	}
	moveB(simuArr, sRight, moved);
	if (moved[0] == true) return false;
	
	for (i = 0; i < 4; i++){
		for (j = 0; j < 4; j++){
			simuArr[i][j] = Arr[i][j];
		}
	}
	moveB(simuArr, sUp, moved);
	if (moved[0] == true) return false;
	
	for (i = 0; i < 4; i++){
		for (j = 0; j < 4; j++){
			simuArr[i][j] = Arr[i][j];
		}
	}
	moveB(simuArr, sDown, moved);
	if (moved[0] == true) return false;
	return true;
}

//指定した方向に動かす moved(配列)には動かせたかどうかが代入される(moved=[true] or moved=[false])
//スコアの増加を返す
//Arr 破壊
function moveB(Arr, Direction, moved){
	
	let i = 0;
	let j = 0;
	let NewScore = 0;
	let TargetColumn = 0;
	let TargetRow = 0;
	let TargetNum = 0;
	
	moved[0] = false;
	
	if (Direction == sLeft){
		for(i = 0; i < 4; i++){
			TargetColumn = 0;
			TargetNum = Arr[i][0];
			for (j = 0; j < 4; j++){
				if (Arr[i][j] != 0){
					if (TargetColumn != j){
						if (TargetNum == 0){
							Arr[i][TargetColumn] = Arr[i][j];
							Arr[i][j] = 0;
							TargetNum = Arr[i][TargetColumn];
							moved[0] = true;
						}else{
							if (TargetNum == Arr[i][j]){
								Arr[i][TargetColumn]++;
								NewScore = NewScore + Math.pow(2, Arr[i][TargetColumn]);
								Arr[i][j] = 0;
								TargetColumn++;
								TargetNum = Arr[i][TargetColumn];//0になるはず
								if (TargetNum != 0)
									console.log('error1');
								moved[0] = true;
							}else{
								TargetColumn++;
								TargetNum = Arr[i][TargetColumn];
								if (TargetColumn != j){
									if (TargetNum != 0)
										console.log('error1');
									Arr[i][TargetColumn] = Arr[i][j];//TargetNum == 0のはず
									Arr[i][j] = 0;
									TargetNum = Arr[i][TargetColumn];
									moved[0] = true;
								}
							}
						}
					}
				}
			}
		}
	}
	
	else if (Direction == sRight){
		for(i = 0; i < 4; i++){
			TargetColumn = 3;
			TargetNum = Arr[i][3];
			for (j = 3; j >= 0; j--){
				if (Arr[i][j] != 0){
					if (TargetColumn != j){
						if (TargetNum == 0){
							Arr[i][TargetColumn] = Arr[i][j];
							Arr[i][j] = 0;
							TargetNum = Arr[i][TargetColumn];
							moved[0] = true;
						}else{
							if (TargetNum == Arr[i][j]){
								Arr[i][TargetColumn]++;
								NewScore = NewScore + Math.pow(2, Arr[i][TargetColumn]);
								Arr[i][j] = 0;
								TargetColumn--;
								TargetNum = Arr[i][TargetColumn];//0になるはず
								if (TargetNum != 0)
									console.log('error1');
								moved[0] = true;
							}else{
								TargetColumn--;
								TargetNum = Arr[i][TargetColumn];
								if (TargetColumn != j){
									if (TargetNum != 0)
										console.log('error1');
									Arr[i][TargetColumn] = Arr[i][j];//TargetNum == 0のはず
									Arr[i][j] = 0;
									TargetNum = Arr[i][TargetColumn];
									moved[0] = true;
								}
							}
						}
					}
				}
			}
		}
	}
	
	else if (Direction == sUp){
		for(j = 0; j < 4; j++){
			TargetRow = 0;
			TargetNum = Arr[0][j];
			for (i = 0; i < 4; i++){
				if (Arr[i][j] != 0){
					if (TargetRow != i){
						if (TargetNum == 0){
							Arr[TargetRow][j] = Arr[i][j];
							Arr[i][j] = 0;
							TargetNum = Arr[TargetRow][j];
							moved[0] = true;
						}else{
							if (TargetNum == Arr[i][j]){
								Arr[TargetRow][j]++;
								NewScore = NewScore + Math.pow(2, Arr[TargetRow][j]);
								Arr[i][j] = 0;
								TargetRow++;
								TargetNum = Arr[TargetRow][j];//0になるはず
								if (TargetNum != 0)
									console.log('error1');
								moved[0] = true;
							}else{
								TargetRow++;
								TargetNum = Arr[TargetRow][j];
								if (TargetRow != i){
									if (TargetNum != 0)
										console.log('error1');
									Arr[TargetRow][j] = Arr[i][j];//TargetNum == 0のはず
									Arr[i][j] = 0;
									TargetNum = Arr[TargetRow][j];
									moved[0] = true;
								}
							}
						}
					}
				}
			}
		}
	}
	
	else if (Direction == sDown){
		for(j = 0; j < 4; j++){
			TargetRow = 3;
			TargetNum = Arr[3][j];
			for (i = 3; i >= 0; i--){
				if (Arr[i][j] != 0){
					if (TargetRow != i){
						if (TargetNum == 0){
							Arr[TargetRow][j] = Arr[i][j];
							Arr[i][j] = 0;
							TargetNum = Arr[TargetRow][j];
							moved[0] = true;
						}else{
							if (TargetNum == Arr[i][j]){
								Arr[TargetRow][j]++;
								NewScore = NewScore + Math.pow(2, Arr[TargetRow][j]);
								Arr[i][j] = 0;
								TargetRow--;
								TargetNum = Arr[TargetRow][j];//0になるはず
								if (TargetNum != 0)
									console.log('error1');
								moved[0] = true;
							}else{
								TargetRow--;
								TargetNum = Arr[TargetRow][j];
								if (TargetRow != i){
									if (TargetNum != 0)
										console.log('error1');
									Arr[TargetRow][j] = Arr[i][j];//TargetNum == 0のはず
									Arr[i][j] = 0;
									TargetNum = Arr[TargetRow][j];
									moved[0] = true;
								}
							}
						}
					}
				}
			}
		}
	}
	
	return NewScore;
	
	//
	//moved[0] = true;  ←○
	//moved[0] = false; ←○
	//
	//moved = [true];  ←×
	//moved = [false]; ←×
	//
}

//空白(0)のうちのどこか一つに2か4を生成する
//Arr 破壊
function generate24(Arr){
	let i = 0;
	let j = 0;
	let SpaceCount = 0;
	let SpaceX = [0];
	let SpaceY = [0];
	
	for (i = 0; i < 4; i++){
		for (j = 0; j < 4; j++){
			if (Arr[i][j] == 0){
				if (SpaceCount == 0){
					SpaceX[0] = i;
					SpaceY[0] = j;
				}else{
					SpaceX.push(i);
					SpaceY.push(j);
				}
				SpaceCount++;
			}
		}
	}
	
	let buf = Math.floor(Math.random() * SpaceCount);
	Arr[SpaceX[buf]][SpaceY[buf]] = NewNumber();
	
}


//一定の確率で1か2を返す
function NewNumber(){
	if (Math.random() < ProportionOf4)
		return 2;
	else
		return 1;
}

//指定した方向に動かし、2か4を生成する
//Arr 破壊
//スコアの増加を返す
function move(Arr, Direction){
	const moved = [true];
	let NewScore = moveB(Arr, Direction, moved);
	if (moved[0] == true)
		if (Mode == 'Normal')
			generate24(Arr);
		else
			generate24Hard(Arr);
		
	return NewScore;
}

//手動用
function MoveMaual(Direction){
	if ((Status != 'GameOver') && (Status != 'AutoPlaying')){
		if (Status == 'Standby'){
			StartTime = Date.now();
			ShowTime();
		}
		Status = 'Playing';
		Score = Score + move(array, Direction);
		if (IsFinished(array) == true)
			GameOver();
		koushin();
	}
}

//左操作 手動用
function MoveLeft(){
	MoveMaual(sLeft);
}

function MoveRight(){
	MoveMaual(sRight);
}

function MoveUp(){
	MoveMaual(sUp);
}

function MoveDown(){
	MoveMaual(sDown);
}


//============================================================================
//HardMode用関数

function SwitchToHard(){
	NewGame();
	if (Status == 'Standby'){
		Mode = 'Hard';
		let S = document.getElementById('btnMode');
		S.setAttribute('value','NormalMode');
		S.setAttribute('onclick','SwitchToNormal();');
		NewGameNoMessage();
		koushin();
	}
}

function SwitchToNormal(){
	NewGame();
	if (Status == 'Standby'){
		Mode = 'Normal';
		let S = document.getElementById('btnMode');
		S.setAttribute('value','HardMode');
		S.setAttribute('onclick','SwitchToHard();');
		NewGameNoMessage();
		koushin();
	}
}

function generate24Hard(Arr){
	let MaxNum = 0;
	let i = 0; let j = 0; let k = 0; let l = 0;
	let moved = [true];
	
	for (i = 0; i < 4; i++){
		for (j = 0; j < 4; j++){
			if (Arr[i][j] > MaxNum){
				MaxNum = Arr[i][j];
			}
		}
	}
	
	let NextPosX = -1; let NextPosY = -1; let NextNum = 0;
	let TargetPosX = [0]; let TargetPosY = [0];
	let Count = 0;
	let simuPosX = 0; let simuPosY = 0; let simuNum = 0;
	let FFlag = false;
	let simuArr = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
	
	for (k = 1; k <= MaxNum; k++){
		TargetPosX = [-1];
		TargetPosY = [-1];
		Count = 0;
		for (i = 0; i < 4; i++){
			for (j = 0; j < 4; j++){
				if (Arr[i][j] == k){
					Count++;
					TargetPosX.push(i);
					TargetPosY.push(j);
				}
			}
		}
		if (TargetPosX[0] != -1){
			for (l = 0; l < count; l++){
				//次の次で合体できる状態を阻止
				simuPosX = TargetPosX[l]; //右に移動したとき
				simuPosY = TargetPosY[l];
				simuNum = 0;
				FFlag = false; //targetが合体したかどうか
				for (j = 3; j >= 0; j--){ //targetposの移動を独自にシミュレーション
					if (Arr[TargetPosX[l]][j] == 0){
						if (j > TargetPosY[l])
							simuPosY++;
					}else{
						if (Arr[TargetPosX[l]][j] == simuNum){
							if (j <= TargetPosY[l]){
								FFlag = true;
								break;
							}
							simuPosY++;
							simuNum = 0;
						}else{
							if (j < TargetPosY[l])
								break;
							simuNum = Arr[TargetPosX[l]][j];
						}
					}
				}
				if (FFlag == false){ //targetが合体していないとき
					simuArr = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
					for (i = 0; i < 4; i++){
						for (j = 0; j < 4; j++){
							simuArr[i][j] = Arr[i][j];
						}
					}
					moveB(simuArr, sRight); //他の移動はmoveBでシミュレーション
					if (Arr[TargetPosX[l]][TargetPosY[l]] != simuArr[simuPosx][simuPosY])
						console.log('Error3'); //独自のシミュレーションがmoveBのシミュレーションとあっているかどうか
					if ((simuArr[TargetPosX[l] - 1][simuPosY] == Arr[TargetPosX[l]][TargetPosY[l]]) || (simuArr[TargetPosX[l] + 1][simuPosY] == Arr[TargetPosX[l]][TargetPosY[l]])){ //右に移動した後、上または下に合体できるとき
						for (j = TargetPosY[l] + 1; j <= simuPosY; j++){
							if (Arr[TargetPosX[l]][j] == 0){
								NextPosX = TargetPosX[l];
								NextPosY = j;
								if (simuNum == 1)
									NextNum = 2;
								else
									NextNum = 1;
								break;
							}
						}
					}
				}
				
				simuPosX = TargetPosX[l]; //左に移動したとき
				simuPosY = TargetPosY[l];
				simuNum = 0;
				FFlag = false; //targetが合体したかどうか
				for (j = 0; j < 4; j++){ //targetposの移動を独自にシミュレーション
					if (Arr[TargetPosX[l]][j] == 0){
						if (j < TargetPosY[l])
							simuPosY--;
					}else{
						if (Arr[TargetPosX[l]][j] == simuNum){
							if (j >= TargetPosY[l]){
								FFlag = true;
								break;
							}
							simuPosY--;
							simuNum = 0;
						}else{
							if (j > TargetPosY[l])
								break;
							simuNum = Arr[TargetPosX[l]][j];
						}
					}
				}
				if (FFlag == false){ //targetが合体していないとき
					simuArr = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
					for (i = 0; i < 4; i++){
						for (j = 0; j < 4; j++){
							simuArr[i][j] = Arr[i][j];
						}
					}
					moveB(simuArr, sLeft); //他の移動はmoveBでシミュレーション
					if (Arr[TargetPosX[l]][TargetPosY[l]] != simuArr[simuPosx][simuPosY])
						console.log('Error3'); //独自のシミュレーションがmoveBのシミュレーションとあっているかどうか
					if ((simuArr[TargetPosX[l] - 1][simuPosY] == Arr[TargetPosX[l]][TargetPosY[l]]) || (simuArr[TargetPosX[l] + 1][simuPosY] == Arr[TargetPosX[l]][TargetPosY[l]])){ //左に移動した後、上または下に合体できるとき
						for (j = simuPosY; j <= TargetPosY[l] - 1; j++){
							if (Arr[TargetPosX[l]][j] == 0){
								NextPosX = TargetPosX[l];
								NextPosY = j;
								if (simuNum == 1)
									NextNum = 2;
								else
									NextNum = 1;
								break;
							}
						}
					}
				}
				
				simuPosX = TargetPosX[l]; //下に移動したとき
				simuPosY = TargetPosY[l];
				simuNum = 0;
				FFlag = false; //targetが合体したかどうか
				for (i = 3; i >= 0; i--){ //targetposの移動を独自にシミュレーション
					if (Arr[i][TargetPosY[l]] == 0){
						if (i > TargetPosX[l])
							simuPosX++;
					}else{
						if (Arr[i][TargetPosY[l]] == simuNum){
							if (i <= TargetPosX[l]){
								FFlag = true;
								break;
							}
							simuPosX++;
							simuNum = 0;
						}else{
							if (i < TargetPosX[l])
								break;
							simuNum = Arr[i][TargetPosY[l]];
						}
					}
				}
				if (FFlag == false){ //targetが合体していないとき
					simuArr = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
					for (i = 0; i < 4; i++){
						for (j = 0; j < 4; j++){
							simuArr[i][j] = Arr[i][j];
						}
					}
					moveB(simuArr, sDown); //他の移動はmoveBでシミュレーション
					if (Arr[TargetPosX[l]][TargetPosY[l]] != simuArr[simuPosx][simuPosY])
						console.log('Error3'); //独自のシミュレーションがmoveBのシミュレーションとあっているかどうか
					if ((simuArr[simuPosX][simuPosY - 1] == Arr[TargetPosX[l]][TargetPosY[l]]) || (simuArr[simuPosX][simuPosY + 1] == Arr[TargetPosX[l]][TargetPosY[l]])){ //右に移動した後、上または下に合体できるとき
						// ↑改変した
						for (i = TargetPosX[l] + 1; i <= simuPosX; i++){
							if (Arr[i][TargetPosY[l]] == 0){
								NextPosX = i;
								NextPosY = TargetPosY[l];
								if (simuNum == 1)
									NextNum = 2;
								else
									NextNum = 1;
								break;
							}
						}
					}
				}
				
				simuPosX = TargetPosX[l]; //上に移動したとき
				simuPosY = TargetPosY[l];
				simuNum = 0;
				FFlag = false; //targetが合体したかどうか
				for (i = 0; i < 4; i++){ //targetposの移動を独自にシミュレーション
					if (Arr[i][TargetPosY[l]] == 0){
						if (i < TargetPosX[l])
							simuPosX--;
					}else{
						if (Arr[i][TargetPosY[l]] == simuNum){
							if (i >= TargetPosX[l]){
								FFlag = true;
								break;
							}
							simuPosX--;
							simuNum = 0;
						}else{
							if (i > TargetPosX[l])
								break;
							simuNum = Arr[i][TargetPosY[l]];
						}
					}
				}
				if (FFlag == false){ //targetが合体していないとき
					simuArr = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
					for (i = 0; i < 4; i++){
						for (j = 0; j < 4; j++){
							simuArr[i][j] = Arr[i][j];
						}
					}
					moveB(simuArr, sUp); //他の移動はmoveBでシミュレーション
					if (Arr[TargetPosX[l]][TargetPosY[l]] != simuArr[simuPosx][simuPosY])
						console.log('Error3'); //独自のシミュレーションがmoveBのシミュレーションとあっているかどうか
					if ((simuArr[simuPosX][simuPosY - 1] == Arr[TargetPosX[l]][TargetPosY[l]]) || (simuArr[simuPosX][simuPosY + 1] == Arr[TargetPosX[l]][TargetPosY[l]])){ //右に移動した後、上または下に合体できるとき
						// ↑改変した
						for (i = simuPosX; i <= TargetPosX[l] - 1; i++){
							if (Arr[i][TargetPosY[l]] == 0){
								NextPosX = i;
								NextPosY = TargetPosY[l];
								if (simuNum == 1)
									NextNum = 2;
								else
									NextNum = 1;
								break;
							}
						}
					}
				}
				
				//次で合体できる状態を阻止
				if ((Arr[TargetPosX[l]][TargetPosY[l] + 1] == 0) && (TargetPosY[l] + 1 < 3)){ //targetpos から右に探索
					for (j = TargetPosY[l] + 2; j < 4; j++){
						if (Arr[TargetposX[l]][j] == k){
							NextPosX = TargetPosX[l];
							NextPosY = TargetPosY[l] + 1;
							if (k = 1)
								NextNum = 2;
							else
								NextNum = 1;
							break;
						}else if (Arr[TargetPosX[l]][j] != 0){
							break;
						}
					}
				}
				if ((Arr[TargetPosX[l]][TargetPosY[l] - 1] == 0) && (TargetPosY[l] - 1 > 0)){ //targetpos から左に探索
					for (j = TargetPosY[l] - 2; j >= 0; j--){
						if (Arr[TargetposX[l]][j] == k){
							NextPosX = TargetPosX[l];
							NextPosY = TargetPosY[l] - 1;
							if (k = 1)
								NextNum = 2;
							else
								NextNum = 1;
							break;
						}else if (Arr[TargetPosX[l]][j] != 0){
							break;
						}
					}
				}
				if ((Arr[TargetPosX[l] + 1][TargetPosY[l]] == 0) && (TargetPosX[l] + 1 < 3)){ //targetpos から下に探索
					for (i = TargetPosX[l] + 2; i < 4; i++){
						if (Arr[i][TargetPosY[l]] == k){
							NextPosX = TargetPosX[l] + 1;
							NextPosY = TargetPosY[l];
							if (k = 1)
								NextNum = 2;
							else
								NextNum = 1;
							break;
						}else if (Arr[i][TargetPosY[l]] != 0){
							break;
						}
					}
				}
				if ((Arr[TargetPosX[l] - 1][TargetPosY[l]] == 0) && (TargetPosX[l] - 1 > 0)){ //targetpos から上に探索
					for (i = TargetPosX[l] - 2; i >= 0; i--){
						if (Arr[i][TargetPosY[l]] == k){
							NextPosX = TargetPosX[l] - 1;
							NextPosY = TargetPosY[l];
							if (k = 1)
								NextNum = 2;
							else
								NextNum = 1;
							break;
						}else if (Arr[i][TargetPosY[l]] != 0){
							break;
						}
					}
				}
			}
		}
	}
	
	let spX = [-1]; let spY = [-1]; let SpaceCount = 0;
	let CandPosX = [-1]; let CandPosY = [-1]; let CandNum = [0]; let CandCount = 0;
	let CandPos2X = [-1]; let CandPos2Y = [-1]; let CandNum2 = [0]; let CandCount2 = 0;
	let x1 = 0;
	let PairCount = 0;
	
	
	for (i = 0; i < 4; i++){
		for (j = 0; j < 4; j++){
			if (Arr[i][j] == 0){
				if (spX[0] == -1){
					spX[0] = i;
					spY[0] = j;
				}else{
					spX.push(i);
					spY.push(j);
				}
				SpaceCount++;
			}
		}
	}
	
	if (NextPosX == -1){
		CandCount = 0;
		for (k = 0; k < SpaceCount; k++){
			
			for (i = 0; i < 4; i++){
				for (j = 0; j < 4; j++){
					simuArr[i][j] = Arr[i][j];
				}
			}
			simuArr[spX[k]][spY[k]] = 1;
			if (ExistPair(simuArr, 1) == 0){
				if (CandPosX[0] == -1){
					CandPosX[0] = spX[k];
					CandPosY[0] = spY[k];
					CandNum[0] = 1;
				}else{
					CandPosX.push(spX[k]);
					CandPosY.push(spY[k]);
					CandNum.push(1);
				}
				CandCount++;
			}
			simuArr[spX[k]][spY[k]] = 2;
			if (ExistPair(simuArr, 2) == 0){
				if (CandPosX[0] == -1){
					CandPosX[0] = spX[k];
					CandPosY[0] = spY[k];
					CandNum[0] = 2;
				}else{
					CandPosX.push(spX[k]);
					CandPosY.push(spY[k]);
					CandNum.push(2);
				}
				CandCount++;
			}
		}
		
		if (CandCount == 0){
			FFlag = false;
			for (k = MaxNum; k >= 1; k--){
				if (FFlag == true)
					break;
				for (i = 0; i < 4; i++){
					if (FFlag == true)
						break;
					for (j = 0; j < 4; j++){
						if (Arr[i][j] == k){
							if ((j != 3) && (Arr[i][j + 1] == 0)){
								if (k == 1)
									Arr[i][j + 1] = 2;
								else
									Arr[i][j + 1] = 1;
								FFlag = true;
								break;
							}
							if ((j != 0) && (Arr[i][j - 1] == 0)){
								if (k == 1)
									Arr[i][j - 1] = 2;
								else
									Arr[i][j - 1] = 1;
								FFlag = true;
								break;
							}
							if ((i != 3) && (Arr[i + 1][j] == 0)){
								if (k == 1)
									Arr[i + 1][j] = 2;
								else
									Arr[i + 1][j] = 1;
								FFlag = true;
								break;
							}
							if ((i != 0) && (Arr[i - 1][j] == 0)){
								if (k == 1)
									Arr[i - 1][j] = 2;
								else
									Arr[i - 1][j] = 1;
								FFlag = true;
								break;
							}
						}
					}
				}
			}
			
			if (FFlag == true){
				console.log('分散化');
			}else{
				x1 = Math.floor(Math.random() * SpaceCount);
				Arr[spX[x1]][spY[x2]] = NextNumber();
				console.log('ランダム');
			}
		}else{
			
			CandCount2 = 0;
			for (k = 0; k < CandCount; k++){
				
				for (i = 0; i < 4; i++){   for (j = 0; j < 4; j++){ //左シミュレーション
					simuArr[i][j] = Arr[i][j];
				}}
				moveB(simuArr, sLeft, moved)
				PairCount = ExistPair(simuArr,CandNum[k]);
				for (i = 0; i < 4; i++){   for (j = 0; j < 4; j++){
					simuArr[i][j] = Arr[i][j];
				}}
				simuArr[CandPosX[k]][CandPosY[k]] = CandNum[k];
				moveB(simuArr, sLeft, moved)
				if (ExistPair(simuArr, CandNum[k]) > PairCount)
					continue;
				
				for (i = 0; i < 4; i++){   for (j = 0; j < 4; j++){ //右シミュレーション
					simuArr[i][j] = Arr[i][j];
				}}
				moveB(simuArr, sRight, moved)
				PairCount = ExistPair(simuArr,CandNum[k]);
				for (i = 0; i < 4; i++){   for (j = 0; j < 4; j++){
					simuArr[i][j] = Arr[i][j];
				}}
				simuArr[CandPosX[k]][CandPosY[k]] = CandNum[k];
				moveB(simuArr, sRight, moved)
				if (ExistPair(simuArr, CandNum[k]) > PairCount)
					continue;
				
				for (i = 0; i < 4; i++){   for (j = 0; j < 4; j++){ //下シミュレーション
					simuArr[i][j] = Arr[i][j];
				}}
				moveB(simuArr, sDown, moved)
				PairCount = ExistPair(simuArr,CandNum[k]);
				for (i = 0; i < 4; i++){   for (j = 0; j < 4; j++){
					simuArr[i][j] = Arr[i][j];
				}}
				simuArr[CandPosX[k]][CandPosY[k]] = CandNum[k];
				moveB(simuArr, sDown, moved)
				if (ExistPair(simuArr, CandNum[k]) > PairCount)
					continue;
				
				for (i = 0; i < 4; i++){   for (j = 0; j < 4; j++){ //上シミュレーション
					simuArr[i][j] = Arr[i][j];
				}}
				moveB(simuArr, sUp, moved)
				PairCount = ExistPair(simuArr,CandNum[k]);
				for (i = 0; i < 4; i++){   for (j = 0; j < 4; j++){
					simuArr[i][j] = Arr[i][j];
				}}
				simuArr[CandPosX[k]][CandPosY[k]] = CandNum[k];
				moveB(simuArr, sUp, moved)
				if (ExistPair(simuArr, CandNum[k]) > PairCount)
					continue;
				
				if (CandPos2X[0] == -1){
					CandPos2X[0] = CandPosX[k];
					CandPos2Y[0] = CandPosY[k];
					CandNum2[0] = CandNum[k];
				}else{
					CandPos2X.push(CandPosX[k]);
					CandPos2Y.push(CandPosY[k]);
					CandNum2.push(CandNum[k]);
				}
				CandCount2++;
				
			}
			
			if (CandCount2 == 0){
				x1 = Math.floor(Math.random() * CandCount);
				Arr[CandPosX[x1]][CandPosY[x1]] = CandNum[x1];
				console.log('3阻止');
			}else{
				x1 = Math.floor(Math.random() * CandCount2);
				Arr[CandPos2X[x1]][CandPos2Y[x1]] = CandNum2[x1];
				console.log('2阻止');
			}
		}
	}else{
		Arr[NextPosX][NextPosY] = NextNum;
		console.log('阻止');
	}
	
	
}

//いずれかの方向に動かして指定した数字を合体させられるかどうか
//Arr 非破壊
function ExistPair(Arr, Num){
	
	let i = 0; let j = 0; let k = 0; let l = 0;
	let x = 0;
	
	for (i = 0; i < 4; i++){
		for (j = 0; j < 4; j++){
			if (Arr[i][j] == Num){
				for (k = j + 1; k < 4; k++){
					if (Arr[i][k] != 0){
						if (Arr[i][k] == Num)
							x++;
						break;
					}
				}
				for (k = j - 1; k >= 0; k--){
					if (Arr[i][k] != 0){
						if (Arr[i][k] == Num)
							x++;
						break;
					}
				}
				for (k = i + 1; k < 4; k++){
					if (Arr[k][j] != 0){
						if (Arr[k][j] == Num)
							x++;
						break;
					}
				}
				for (k = i - 1; k >= 0; k--){
					if (Arr[k][j] != 0){
						if (Arr[k][j] == Num)
							x++;
						break;
					}
				}
			}
		}
	}
	
	return x;
	
}


//============================================================================
//AutoMode用関数

let StopFlag = false;

function Evaluate(Arr){
	return Evaluate1(Arr);
}

//Arr 非破壊
function Evaluate1(Arr){
	
	let sum = 0;
	let MaxNum = 0;
	let i = 0; let j = 0; let k = 0;
	let Count = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	let buf = 0;
	
	for (i = 0; i < 4; i++){
		for (j = 1; j < 4; j++){
			sum = sum + Math.pow(3, Arr[i][j]);
			Count[Arr[i][j]]++;
			if (Arr[i][j] != 0){
				MaxNum = 0;
				for (k = j + 1; k < 4; k++){
					if (MaxNum == 0){
						if (Arr[i][j] < Arr[i][k])
							MaxNum = Arr[i][k];
					}else{
						if (MaxNum <= Arr[i][k]){
							MaxNum = Arr[i][k];
						}else{
							sum = sum - (Math.pow(2, MaxNum) - Math.pow(2, Arr[i][j]));
							break;
						}
					}
				}
				MaxNum = 0;
				for (k = j - 1; k >= 0; k--){
					if (MaxNum == 0){
						if (Arr[i][j] < Arr[i][k])
							MaxNum = Arr[i][k];
					}else{
						if (MaxNum <= Arr[i][k]){
							MaxNum = Arr[i][k];
						}else{
							sum = sum - (Math.pow(2, MaxNum) - Math.pow(2, Arr[i][j]));
							break;
						}
					}
				}
				MaxNum = 0;
				for (k = i + 1; k < 4; k++){
					if (MaxNum == 0){
						if (Arr[i][j] < Arr[k][j])
							MaxNum = Arr[k][j];
					}else{
						if (MaxNum <= Arr[k][j]){
							MaxNum = Arr[k][j];
						}else{
							sum = sum - (Math.pow(2, MaxNum) - Math.pow(2, Arr[i][j]));
							break;
						}
					}
				}
				MaxNum = 0;
				for (k = i - 1; k >= 0; k--){
					if (MaxNum == 0){
						if (Arr[i][j] < Arr[k][j])
							MaxNum = Arr[k][j];
					}else{
						if (MaxNum <= Arr[k][j]){
							MaxNum = Arr[k][j];
						}else{
							sum = sum - (Math.pow(2, MaxNum) - Math.pow(2, Arr[i][j]));
							break;
						}
					}
				}
			}
		}
	}
	
	/*
	buf = 0;
	for (k = 1; k <= 20; k++){
		if (Count[k] > 1){
			buf = buf + Count[k] - 1;
		}
	}
	*/
	
	return sum;
	
}

function BestDirection(Arr, Depth, Expectation){
	let Direction = '';
	let MaxNum = 0.1;
	let TargetNum = 0.1;
	let FirstFlag = true;
	let moved = [true];
	
	TargetNum = CalcExpectation(Arr, sDown, Depth, moved)
	if (moved[0] == true){
		if (FirstFlag == true){
			MaxNum = TargetNum;
			Direction = sDown;
			FirstFlag = false;
		}else if (MaxNum < TargetNum){
			MaxNum = TargetNum;
			Direction = sDown;
		}
	}
	
	TargetNum = CalcExpectation(Arr, sRight, Depth, moved)
	if (moved[0] == true){
		if (FirstFlag == true){
			MaxNum = TargetNum;
			Direction = sRight;
			FirstFlag = false;
		}else if (MaxNum < TargetNum){
			MaxNum = TargetNum;
			Direction = sRight;
		}
	}
	
	TargetNum = CalcExpectation(Arr, sLeft, Depth, moved)
	if (moved[0] == true){
		if (FirstFlag == true){
			MaxNum = TargetNum;
			Direction = sLeft;
			FirstFlag = false;
		}else if (MaxNum < TargetNum){
			MaxNum = TargetNum;
			Direction = sLeft;
		}
	}
	
	TargetNum = CalcExpectation(Arr, sUp, Depth, moved)
	if (moved[0] == true){
		if (FirstFlag == true){
			MaxNum = TargetNum;
			Direction = sUp;
			FirstFlag = false;
		}else if (MaxNum < TargetNum){
			MaxNum = TargetNum;
			Direction = sUp;
		}
	}
	
	Expectation[0] = MaxNum;
	return Direction;
	
}

function CalcExpectation(Arr, Direction, Depth, moved){
	let SpaceCount = 0;
	let spX = [-1]; let spY = [-1];
	let i = 0; let j = 0; let k = 0;
	let x = 0;
	let simuArr = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
	let buf = [0];
	
	for (i = 0; i < 4; i++){
		for (j = 0; j < 4; j++){
			simuArr[i][j] = Arr[i][j];
		}
	}
	
	moveB(simuArr, Direction, moved);
	if (moved[0] == false)
		return;
	
	for (i = 0; i < 4; i++){
		for (j = 0; j < 4; j++){
			if (simuArr[i][j] == 0){
				if (SpaceCount == 0){
					spX[0] = i;
					spY[0] = j;
				}else{
					spX.push(i);
					spY.push(j);
				}
				SpaceCount++;
			}
		}
	}
	
	
	for (k = 0; k < SpaceCount; k++){
		if (Depth == 1){    //終了条件
			simuArr[spX[k]][spY[k]] = 1;
			x = x + (Evaluate(simuArr) * (1 - ProportionOf4) / SpaceCount);
			simuArr[spX[k]][spY[k]] = 2;
			x = x + (Evaluate(simuArr) * ProportionOf4 / SpaceCount);
		}else{              //再帰
			simuArr[spX[k]][spY[k]] = 1;
			BestDirection(simuArr, Depth - 1, buf);
			x = x + (buf[0] * (1 - ProportionOf4) / SpaceCount);
			simuArr[spX[k]][spY[k]] = 2;
			BestDirection(simuArr, Depth - 1, buf);
			x = x + (buf[0] * (1 - ProportionOf4) / SpaceCount);
		}
	}
	
	return x;
	
}

function CountSpace(Arr){
	let i = 0; let j = 0;
	let sum = 0;
	
	for (i = 0; i < 4; i++){
		for (j = 0; j < 4; j++){
			if (Arr[i][j] == 0){
				sum++;
			}
		}
	}
	
	return sum;
	
}

function Auto(){
	if ((Status == 'Standby') || (Status == 'AutoPlaying')){
		console.log('Auto_Start');
		StopFlag = false;
		Status = 'AutoPlaying';
		AutoB();
	}else{
		if(confirm('今のゲームの状態は破棄されます。\nオートモードでゲームを始めますか?')){
			console.log('Auto_Start');
			NewGameNoMessage();
			StopFlag = false;
			Status = 'AutoPlaying';
			AutoB();
		}
	}
}

function AutoB(){
	
	let Depth = 2;
	let D = [0];
	let spCount = CountSpace(array);
	
	if (StopFlag == true)
		return;
	
	//console.log('Auto_Playing');
	
	if (spCount >= 6){
		Depth = 2;
	}else{
		Depth = 3;
	}
	
	
	if (Status != 'GameOver'){
		Score = Score + move(array, BestDirection(array, Depth, D));
		if (IsFinished(array) == true){
			GameOver();
			koushin();
		}else{
			koushin();
			window.setTimeout("AutoB()", "80");
		}
	}
	
}

function StopAuto(){
	StopFlag = true;
}

//============================================================================

//背景色を返す
function BackC(Num) {
	switch (Num){
		case 0:
			return "#BFAFA0";
		case 1:
			return "#EFE4DA";
		case 2:
			return "#EFE2CE";
		case 3:
			return "#F4B37F";
		case 4:
			return "#F7986C";
		case 5:
			return "#F97E69";
		case 6:
			return "#F76147";
		case 7:
			return "#EED690";
		case 8:
			return "#EED384";
		case 9:
			return "#EED279";
		case 10:
			return "#EECE6B";
		case 11:
			return "#EFCC60";
		default:
			return "#000000";
	}
}

//文字色を返す
function ForeC(Num){
	switch (Num){
		case 1:
		case 2:
			return "#796E63";
		default:
			return "#FAF6F4";
	}
}

//フォントサイズを返す
function FontS(Num){
	switch (Num){
		case 0:
		case 1:
		case 2:
		case 3:
			return 6;
		case 4:
		case 5:
		case 6:
			return 5;
		case 7:
		case 8:
		case 9:
			return 5;
		case 10:
		case 11:
		case 12:
		case 13:
			return 4;
		default:
			return 3;
	}
}

//文字色とフォントサイズの情報(html)を含んだ数字を返す
function AddTag(Num){
	return '<font color="' + ForeC(Num) + '" size="' + FontS(Num) + '">' + Math.pow(2, Num) + '</font>';
}

//変数の内容を画面に更新する
function koushin(FinishCheck = true, First = false){
	
	let table = document.getElementById('targetTable');
	let i = 0;
	let j = 0;
	
	for(i = 0; i < 4; i++){
		for(j = 0; j <4; j++){
			table.rows[i].cells[j].setAttribute('bgcolor',BackC(array[i][j]));
			if(array[i][j] == 0)
				table.rows[i].cells[j].innerHTML = '';
			else
				table.rows[i].cells[j].innerHTML = AddTag(array[i][j]);
		}
	}
	
	if (StartTime != 0){
		let arrayNewMaxNum = fMaxNum(array);
		if (arrayNewMaxNum > arrayMaxNum){
			LapTime[arrayNewMaxNum] = (Date.now() - StartTime) / 1000;
			arrayMaxNum = arrayNewMaxNum;
			let S = document.getElementById('laptime');
			S.innerHTML = 'LapTime: ' + fLapTime(11);
		}
	}
	
	/*
	for (i = 0; i < 4; i++){
		for (j = 0; j < 4; j++){
			console.log(i + '_' + j + ' ' + array[i][j]);
		}
	}
	*/
	//console.log(Evaluate(array));
	
	ShowStatus();
	ShowScore();
	ShowMode();
	
}

//Num以上のラップタイムを返す。
function fLapTime(Num){
	let i = Num;
	let x = '';
	
	for (i = Num; i < 18; i++){
		if (LapTime[i] == 0){
			if ((i != 1) && (i != 2))
				break;
		}
		x = x + (Math.pow(2, i)) + ':' + LapTime[i] + ', ';
		
	}
	return x;
	
}

function AlertLapTime(){
	let str = fLapTime(1);
	str = str.replace(/, /g,'\n')
	str = str.replace(/:/g,'\t:')
	
	alert(str.replace(/, /g,'\n'));
}

//ゲームオーバーにする
function GameOver(){
	Status='GameOver';
	ShowStatus();
}

//ステータスを反映する
function ShowStatus(){
	let S = document.getElementById('status');
	if (S.innerHTML != '<font color="#FF0000" ><b>status:Error</b></font>'){
		if (Status == 'Error'){
			S.innerHTML = '<font color="#FF0000" ><b>status:' + Status + '</b></font>';
		}else{
			S.innerHTML = 'status:' + Status;
		}
	}
}

//ステータスをエラーにする
function Error(){
	Status = 'Error';
	ShowStatus();
}

//スコアを反映する
function ShowScore(){
	let S = document.getElementById('score');
	S.innerHTML = 'score:' + Score;
}

//モードを反映する
function ShowMode(){
	let S = document.getElementById('mode');
	if (Mode == 'Hard'){
		S.innerHTML = 'mode:<font color="#FF0000">' + Mode + '</font>';
	}else{
		S.innerHTML = 'mode:' + Mode;
	}
}

//タイムを反映する
function ShowTime(){
	if (StartTime != 0){
		let S = document.getElementById('time');
		S.innerHTML = 'time:' + ((Date.now() - StartTime) / 1000);
		if (Status != 'GameOver'){
			window.setTimeout("ShowTime()", "30");
		}
	}
}
