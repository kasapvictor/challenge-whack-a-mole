/**
 * Задает старт и стоп и сброс таймера через setInterval
 */
class Timer {
	constructor ( fn, t ) {
		this.fn = fn;
		this.t = t;
		this.timerObj = setInterval ( this.fn, this.t );
	}

	stop () {
		if ( this.timerObj ) {
			clearInterval ( this.timerObj );
			this.timerObj = null;
		}
		return this;
	}

	start () {
		if ( !this.timerObj ) {
			this.stop ();
			this.timerObj = setInterval ( this.fn, this.t );
		}
		return this;
	}

	reset ( newT = this.t ) {
		this.t = newT;
		return this.stop ().start ();
	}
}

const soundsWrap = document.querySelector ( '.sounds' );
const sound = {
	hover1: soundsWrap.querySelector ( '#hover1' ),
	hover2: soundsWrap.querySelector ( '#hover2' ),
	hover3: soundsWrap.querySelector ( '#hover3' ),
	hit: soundsWrap.querySelector ( '#hit' ),
	beep: soundsWrap.querySelector ( '#beep' ),
	audioBg1: soundsWrap.querySelector ( '#background1' ),
	audioBg2: soundsWrap.querySelector ( '#background2' )
};
const app = document.querySelector ( '.app' );
const appScore = app.querySelector ( '.app__score-current' ); // очки
const appScoreMobile = app.querySelector ( '.app__score-current--mobile' ); // очки в моб версии
const appMaxScore = app.querySelector ( '.app__score-max' ); // максимальное кол-во очков
const appField = app.querySelector ( '.app__field' ); // игровое поле
const appHoles = appField.querySelectorAll ( '.app__hole' ); // кротовые норы
const appMoles = appField.querySelectorAll ( '.app__mole' ); // кроты
const appStart = app.querySelector ( '.app__start' ); // кнопка старт
const appLevel = app.querySelector ( '.app__level-count' ); // текущий уровень
const appLevelButtons = app.querySelectorAll ( '.app__level-button' );
const appTimer = app.querySelector ( '.app__timer' ); // таймер
const appReset = app.querySelector ( '.app__reset' ); // кнопка сброса
const appSoundButton = document.querySelector ( '.app__sound' ); // кнопка музыки
const bgSound = createSound ( 'audioBg2', .01 ); // фоновая музыка
const hitSound = createSound  ( 'hit', .1, 3, .5 ); // попадание звук
const missSound = createSound('hover1', .7, 3, .1 ); // промах звук
const date = new Date ().toLocaleDateString (); // текущая дата 05.08.2021
const maxLevel = 10; // максимальный уровень
const delimiter = 1600; // стартовый интервал
const startTime = 15; // начальное значение времени
let gameOver = false; // конец игры
let isGame = false; // игра сейчас идет

switchButtonReset ( true ); // скрываем кнопку appReset по умолчанию

// Сброс прогресса при клике на appReset
appReset.addEventListener ( 'click', appResetAll );

// изменение уровня
appLevelButtons.forEach ( button => button.addEventListener ( 'click', ( e ) => changeLevel ( e ) ) );

// нажатие на кнопку Старт
appStart.addEventListener ( 'click', () => {
	appStart.style.display = 'none';
	startAppTimer ();
	isGame = true; // игра идет
	// проигрывание фоновой музыки если звук не отключен
	if ( !appSoundButton.classList.contains ( 'app__sound--off' ) ) {
		bgSound.play ();
	}
} );

// событие при попадании в крота
appMoles.forEach ( mole => mole.addEventListener ( 'click', () => { moleHit ( mole )} ) )

/*
 * Игровые функции
 */

// изменение уровня сложности
function changeLevel ( e ) {
	const el = e.target;
	const currentLvl = getCurrentLevel ();

	// если нажат + то прибавить уровень
	if ( el.classList.contains ( 'app__level-plus' ) ) {
		if ( currentLvl === maxLevel ) {
			return false;
		} else {
			appLevel.innerHTML = `${ currentLvl + 1 }`;
		}
	}

	// если нажат - то убавить уровень
	if ( el.classList.contains ( 'app__level-minus' ) ) {
		if ( currentLvl === 1 ) {
			return false;
		} else {
			appLevel.innerHTML = `${ currentLvl - 1 }`;
		}
	}
}

// запуск таймера (игры)
function startAppTimer () {
	const timer = new Timer ( () => { updateTimer ( timer ) }, 1000 );
	const timerMole = new Timer ( () => { moleUp ( timerMole ) }, getTimeOut () );

	// установка времени по умолчанию в верстке из переменной startTime
	appTimer.innerHTML = `${ startTime }`;

	timer.start (); // запуск таймера
	timerMole.start (); // запуск таймера для кротов

	resetScore (); // сброс очков
	switchButtonsLevel ( true ); // спрятать кнопки переключения уровня
}

// обновляем значение времени
function updateTimer ( timer ) {
	const currentTime = getCurrentTime () - 1;

	if ( currentTime < 0 ) {
		gameOver = true;
		timer.stop (); // конец игры
		reActiveStart (); // отобразить кнопку start
		updateMaxScore (); // обновление максимальных очков
		switchButtonsLevel ( false ); // показать кнопки переключения уровня
		setLocalScore (); // обновление данных в localScore
		removeMalesUp (); // удалить у всех норм класс app__hole--up
		stopSound ( bgSound ); // остановить фоновую музыку
		appTimer.innerHTML = `${ startTime }`;
		isGame = false; // игра не идет
	} else {
		appTimer.innerHTML = `${ currentTime }`; // отнимает по 1 значению от текущего
	}
}

// получаем актуальное значение времени
function getCurrentTime () {
	// return gameTime;
	return +appTimer.textContent;
}

// получает текущий уровень
function getCurrentLevel () {
	return +appLevel.textContent;
}

// получает текущие очки
function getCurrentScore () {
	return +appScore.textContent;
}

// возвращает таймаут изменений
function getTimeOut () {
	return delimiter - (getCurrentLevel () * 100);
}

// показать крота
function moleUp ( timer ) {
	const length = appHoles.length - 1;
	const index = random ( 0, length );
	const hole = appHoles[index];

	if ( gameOver ) {
		timer.stop ();
		gameOver = false;
	} else {
		// если нет класса app__hole--up на текущем элементе то добавить
		if ( !hole.classList.contains ( 'app__hole--up' ) ) {
			hole.classList.add ( 'app__hole--up' );
			moleDown ( index );
			missSound.play(); // звук
		}
	}
}

// спрятать крота
function moleDown ( index ) {
	setTimeout ( () => {
		appHoles[index].classList.remove ( 'app__hole--up' );
	}, getTimeOut () )
}

// смена изображения при попадании в крота
function moleHit ( mole ) {
	if ( mole.classList.contains ( 'app__mole--dead' ) ) {
		return false;
	} else {
		updateScore ();
		moleToDead ( mole );
		moleToGood ( mole );
		hitSound.play();
	}
}

// добавляет класс для элемента app__mole--dead
function moleToDead ( mole ) {
	mole.classList.add ( 'app__mole--dead' );
}

// удаляет класс app__mole--dead
function moleToGood ( mole ) {
	mole.ontransitionend = () => mole.classList.remove ( 'app__mole--dead' );
}

// удалить у всех нор класс app__hole--up
function removeMalesUp () {
	appHoles.forEach ( item => item.classList.remove ( 'app__hole--up' ) );
}

// повторно отобразить кнопку старт
function reActiveStart () {
	appStart.style.display = 'block';
}

// обновление очков при попадании
function updateScore () {
	const newScore = getCurrentScore () + 1;
	appScore.innerHTML = `${ newScore }`;
	appScoreMobile.innerHTML = `${ newScore }`;
}

// обновление максимальных очков, если текущие очки выше максимальных
function updateMaxScore () {
	const currentScore = getCurrentScore ();
	const max = getMaxScore ();

	if ( currentScore > max ) {
		appMaxScore.innerHTML = `${ currentScore }`;
	}
}

// возвращает значение из поля appMaxScore
function getMaxScore () {
	return +appMaxScore.textContent;
}

// сброс очков
function resetScore () {
	appScore.innerHTML = '0';
}

// прячет кнопки изменения уровня
function switchButtonsLevel ( hide ) {
	if ( hide ) {
		appLevelButtons.forEach ( button => button.style.display = 'none' );
	} else {
		appLevelButtons.forEach ( button => button.style.display = 'flex' );
	}
}

// выключение / включение кнопки Reset
function switchButtonReset ( hide ) {
	if ( hide ) {
		appReset.style.display = 'none';
	} else {
		appReset.style.display = 'block';
	}
}

// сброс прогресса
function appResetAll () {
	deleteLocalScore ();
	appLevel.innerHTML = '1';
	appScore.innerHTML = '0';
	appHistoryList.innerHTML = '...';
	appMaxScore.innerHTML = '0';
	switchButtonReset ( true );
}

/*
 * Вспомогательные функции сохранения значений
 */

// возвращает случайное число от min до max
function random ( min, max ) {
	min = Math.ceil ( min );
	max = Math.floor ( max );
	return Math.floor ( Math.random () * (max - min + 1) ) + min;
}

/*
 * Функции сохранения значений
 */
const appHistoryList = app.querySelector ( '.app__history-list' );

// обновляет список в истории
updateAppHistory ();

// получение значений из localStorage
function getLocalScore () {
	const data = JSON.parse ( localStorage.getItem ( 'whackamole' ) );
	return data;
}

// установка значений в localStorage
// [{ date, lvl: 1, score: 20 }, { date, lvl: 2, score: 10 }]
function setLocalScore () {
	const dataLocal = getLocalScore ();
	const newData = { date, lvl: getCurrentLevel (), score: getCurrentScore (), max: getMaxScore () };
	let data;

	if ( dataLocal ) {
		if ( dataLocal.length === 6 ) {
			dataLocal.pop ();
		}
		dataLocal.unshift ( newData );
		data = dataLocal;
	} else {
		data = [ newData ];
	}

	// запись в localStorage последний результат
	localStorage.setItem ( 'whackamole', JSON.stringify ( data ) );

	updateAppHistory (); // обновление истории
}

// обновляет значение истории
function updateAppHistory () {
	const history = getLocalScore ();
	let html;

	if ( history ) {
		html = history.map ( item => {
			return `<p class="app__text text--small">${ item.date }: (lvl ${ item.lvl }) - ${ item.score }</p>`;
		} ).join ( '' );
		switchButtonReset ( false );// показываем кнопку сброса
	} else {
		html = '...';
	}

	appHistoryList.innerHTML = html;

	// обновление максимального значение из localStorage
	updateMaxScoreFromLocalStorage ();
}

// обновление максимального значение из localStorage
function updateMaxScoreFromLocalStorage () {
	const data = getLocalScore ();

	if ( data ) {
		data.forEach ( item => {
			const currentMax = getMaxScore ();

			if ( item.max > currentMax ) {
				appMaxScore.innerHTML = `${ item.max }`;
			}
		} );
	}
}

// удаление значений из localStorage
function deleteLocalScore () {
	localStorage.removeItem ( 'whackamole' );
}


/**
 * Функции UI для моб версий
 */
const appMobileScoreList = app.querySelector ( '.app__button-mobile-score' );
const appAside = app.querySelector ( '.app__aside' );
const appButtonClose = appAside.querySelector ( '.app__button-mobile-close' );

// показать статистика в моб версии
appMobileScoreList.addEventListener ( 'click', () => appAside.style.display = 'flex' );
// скрыть статистику в моб версии
appButtonClose.addEventListener ( 'click', () => appAside.style.display = 'none' );
// отключить/включить фоновую мелодию
appSoundButton.addEventListener ( 'click', () => {
	appSoundButton.classList.toggle ( 'app__sound--off' );

	if ( appSoundButton.classList.contains ( 'app__sound--off' ) ) {
		muteSound ( bgSound );
	} else {
		// если звук был выключен и нажали старт потом включили звук то проверить
		// находится ли мелодия на паузе игра isGame=true
		if ( bgSound.paused && isGame ) {
			bgSound.play ();
		}
		unMuteSound ( bgSound );
	}
} )

// проигрывание музыки
function createSound ( name, volume = .5, speed = 1, currentTime = .5 ) {
	const s = sound[`${ name }`];
	unMuteSound ( s );
	s.currentTime = currentTime;
	s.volume = volume;
	s.playbackRate = speed;
	return s;
}

// остановить проигрывание
function stopSound ( sound ) {
	sound.pause ();
}

// включить звук
function muteSound ( sound ) {
	sound.muted = true;
}

// выключить звук
function unMuteSound ( sound ) {
	sound.muted = false;
}


