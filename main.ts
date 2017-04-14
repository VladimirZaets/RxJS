/**
 * Простая реализация rxjs stream.
 *
 * Observer - interface
 *
 * Описание:
 * Можем импортировать весь rxjs,
 * а также импортировать отдельно функциональнось
 */
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/delay';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/fromEvent';
import {delay} from "rxjs/operator/delay";


let numbers = [1,5,10];
let sourceFirstExample = Observable.from(numbers);


/**
 * Example #1
 */
class MyObserver implements Observer<number> {

	next(value) {
		console.log(`value: ${value}`);
	}

	error(e) {
		console.log(`error: ${e}`);
	}

	complete() {
		console.log('complete');
	}
}

//sourceFirstExample.subscribe(new MyObserver());

/**
 * Example #2
 *
 * Преймущества:
 * Не нужно создавать новый class.
 *
 * Описание:
 * Передаем в метод "subscribe" три безымьянных функции как аргументы.
 * Данные функции представляют собой три метода интерфейса "next", "error", "complete".
 */

let sourceSecondExample = Observable.from(numbers);
/*

sourceSecondExample.subscribe(
    value => console.log(`value: ${value}`), // next
    e => console.log(`error: ${e}`),         // error
    () =>console.log('complete')             // complete
);
*/


/**
 * Example #3
 *
 * Описание:
 * Создание своего поведения для стрима
 */
let sourceThirdExample  = Observable.create(observer => {
    for (let n of numbers) {
        if (n === 5) {
            // При возникновении ошибки стрим прекращается
            observer.error('Something went wrong!');
        }

        observer.next(n);
    }

    observer.complete();
});
/*
sourceThirdExample.subscribe(
    value => console.log(`value: ${value}`), // next
    e => console.log(`error: ${e}`),         // error
    () =>console.log('complete')             // complete
);*/

/**
 * Example #4
 *
 * Описание: Асинхронный стрим
 */
let sourceFourthExample  = Observable.create(observer => {
    let index = 0,
        produceValue = () => {
            observer.next(numbers[index++]);

            if (index < numbers.length) {
                setTimeout(produceValue, 2000);
            } else {
                observer.complete();
            }
        };

        produceValue();
});
/*
 sourceFourthExample.subscribe(
 value => console.log(`value: ${value}`), // next
 e => console.log(`error: ${e}`),         // error
 () =>console.log('complete')             // complete
 );*/

/**
 * Example #4
 *
 * Описание: Асинхронный стрим c постобработкой
 */
let sourceFifthExample  = Observable.create(observer => {
    let index = 0,
        produceValue = () => {
            observer.next(numbers[index++]);

            if (index < numbers.length) {
                setTimeout(produceValue, 250);
            } else {
                observer.complete();
            }
        };

    produceValue();
})  .map(n => n * 2)
    .filter(n => n > 4);

sourceFifthExample.subscribe(
    value => console.log(`value: ${value}`), // next
    e => console.log(`error: ${e}`),         // error
    () =>console.log('complete')             // complete
);

/**
 * Example #5
 *
 * Описание: Стримминг событий
 */
let circle = document.getElementById('circle');
let sourceSixthExample = Observable.fromEvent(document, 'mousemove')
    .map((e : MouseEvent) => {
        return {
            x: e.clientX,
            y: e.clientY
        }
    })
    .filter(value => value.x < 500)
    .delay(300);


function onNext(value) {
    circle.style.left = `${value.x}px` ;
    circle.style.top = `${value.y}px`;
}

sourceSixthExample.subscribe(
    onNext, // next
    e => console.log(`error: ${e}`),         // error
    () =>console.log('complete')             // complete
);


/**
 * Example #5
 *
 * Описание: Стримминг событий
 *//*
let output = document.getElementById('output');
let button = document.getElementById('button');
let click = Observable.fromEvent(button, 'click');


function load (url: string) {
   let xhr = new XMLHttpRequest();

    xhr.addEventListener('load', () => {
        let movies = JSON.parse(xhr.responseText);

        movies.forEach(m => {
            let div = document.createElement('div');

            div.innerText = m.title;
            output.appendChild(div);
        })
    });

    xhr.open('GET', url);
    xhr.send();
}

click.subscribe(
    e => load('movies.json'), // next
    e => console.log(`error: ${e}`),         // error
    () =>console.log('complete')             // complete
);*/

/**
 * Example #6
 *
 * Описание: mergeMap, retry
 */

let output = document.getElementById('output');
let button = document.getElementById('button');
let click = Observable.fromEvent(button, 'click');


function load (url: string) {
    return Observable.create(obsorver => {
        let xhr = new XMLHttpRequest();

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                let data = JSON.parse(xhr.responseText);

                obsorver.next(data);
                obsorver.complete();
            } else {
                obsorver.error(xhr.statusText);
            }
        });

        xhr.open('GET', url);
        xhr.send();

    }).retryWhen(retryStrategy({
        attempts: 3,
        delay: 1500
    }));
}

function retryStrategy({attempts = 4, delay = 1000}) {
    return errors => errors
        .scan((acc) => acc + 1)
        .takeWhile((value, acc) => acc < attempts)
        .delay(delay);
}

function render (movies) {
    movies.forEach(m => {
        let div = document.createElement('div');

        div.innerText = m.title;
        output.appendChild(div);
    });
}

load('movies.json').subscribe(render);

click.mergeMap(e => load('movies.json'))
    .subscribe(
        render,
        e => console.log(`error: ${e}`),
        () =>console.log('complete')
    );
