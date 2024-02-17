class WordForms {
    constructor() {
        this.forms = {
            "years": ["год", "года", "лет"],
            "months": ["месяц", "месяца", "месяцев"],
            "days": ["день", "дня", "дней"],
            "hours": ["час", "часа", "часов"],
            "minutes": ["минута", "минуты", "минут"],
            "seconds": ["секунда", "секунды", "секунд"],
        };
    }

    getWordForm(number, wordType) {
        const remainder = number % 10;
        if (number === 1 || (number > 20 && remainder === 1)) {
            return this.forms[wordType][0];
        } else if ((number >= 2 && number <= 4) || (number > 20 && remainder >= 2 && remainder <= 4)) {
            return this.forms[wordType][1];
        } else {
            return this.forms[wordType][2];
        }
    }
}

class Lesson {
    constructor(start_hour, start_minute, end_hour, end_minute, lesson_number) {
        this.start_hour = start_hour
        this.start_minute = start_minute
        this.end_hour = end_hour
        this.end_minute = end_minute
        this.lesson_number = lesson_number
        this.couple_number = null
    }
    startTimeToSeconds() {
        return this.start_hour * 3600 + this.start_minute * 60
    }
    endTimeToSeconds() {
        return this.end_hour * 3600 + this.end_minute * 60
    }
    setCoupleNumber(couple_number) {
        this.couple_number = couple_number
        return this
    }
}

class Couple {
    constructor(couple_number, lesson_1, lesson_2) {
        this.lesson_1 = lesson_1.setCoupleNumber(couple_number)
        this.lesson_2 = lesson_2.setCoupleNumber(couple_number)
        this.couple_number = couple_number
        this.lessons = [lesson_1, lesson_2]
    }
    endTimeToSeconds() {
        // получить время окончания 2 урока
        return this.lessons[1].endTimeToSeconds()
    }
    startTimeToSeconds() {
        // получить время начала 1 урока
        return this.lessons[0].startTimeToSeconds()
    }
}

class Schedule {
    constructor() {
        this.wordForms = new WordForms();
        this.countdownElement = document.getElementById('countdown');
        this.eventElement = document.getElementById('event');
        this.schedule = this.setupSchedule();
        setInterval(this.checkSchedule.bind(this), 1000);
    }
    setupSchedule() {
        const now = new Date();
        const currentDay = now.getDay();

        if (currentDay >= 1 && currentDay <= 5) {
            return [
                new Couple(
                    1,
                    new Lesson(8, 30, 9, 30, 1),
                    new Lesson(9, 35, 10, 20, 2)
                ),
                new Couple(
                    2,
                    new Lesson(10, 40, 11, 25 ,1),
                    new Lesson(11, 40, 12, 25, 2)
                ),
                new Couple(
                    3,
                    new Lesson(12, 45, 13, 30, 1),
                    new Lesson(13, 35, 14, 20, 2)
                ),
                new Couple(
                    4,
                    new Lesson(14, 30, 15, 15, 1),
                    new Lesson(15, 20, 16, 5, 2)
                ),
            ]
        } else if (currentDay === 6) {
            return [
                new Couple(
                    1,
                    new Lesson(8, 30, 9, 10, 1),
                    new Lesson(9, 15, 9, 55, 2)
                ),
                new Couple(
                    2,
                    new Lesson(10, 15, 10, 55, 1),
                    new Lesson(11, 5, 11, 45, 2),
                ),
                new Couple(
                    3,
                    new Lesson(12, 5, 12, 45, 1),
                    new Lesson(12, 50, 13, 30, 2),
                )
            ]
        } else {
            this.eventElement.innerText = "Сегодня выходной";
            this.countdownElement.innerText = "";
            return [];
        }
    }

    calculateTime(time) {
        let hours = Math.floor(time / 3600);
        let minutes = Math.floor(time / 60);
        let seconds = Math.floor(time % 60);
        let string = '';

        if (hours > 0) {
            string += `<nobr>${hours} ${this.wordForms.getWordForm(hours, 'hours')}</nobr> `;
        }
        if (minutes > 0) {
            string += `<nobr>${minutes} ${this.wordForms.getWordForm(minutes, 'minutes')}</nobr> `;
        }
        string += `<nobr>${seconds} ${this.wordForms.getWordForm(seconds, 'seconds')}</nobr>`;

        return string;
    }
    checkSchedule() {
        const now = new Date();
        const currentTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds(); // Переводим текущее время в секунды
        if (currentTime > this.schedule[this.schedule.length - 1].endTimeToSeconds()) {
            this.eventElement.innerText = "Пары закончились"
            this.countdownElement.innerText = "";
            return;
        } else if (currentTime < this.schedule[0].startTimeToSeconds()) {
            this.eventElement.innerText = "Пары еще не начались"
            this.countdownElement.innerText = "";
            return;
        }

        let couple
        let next_couple
        for (let i = 0; i < this.schedule.length; i++) {
            if (this.schedule[i].startTimeToSeconds() <= currentTime && this.schedule[i].endTimeToSeconds() >= currentTime) {
                couple = this.schedule[i];
                next_couple = this.schedule[i + 1];
                break;
            }
            if (this.schedule[i].endTimeToSeconds() < currentTime && this.schedule[i + 1].startTimeToSeconds() > currentTime) {
                couple = null;
                next_couple = null;
                break;
            }
        }
        if (couple === null && next_couple === null) {
            // найти между какими парами мы находимся
            let first_couple
            let second_couple
            for (let i = 0; i < this.schedule.length; i++) {
                if (this.schedule[i].endTimeToSeconds() < currentTime && this.schedule[i + 1].endTimeToSeconds() > currentTime) {
                    first_couple = this.schedule[i];
                    second_couple = this.schedule[i + 1];
                    break;
                }
            }
            this.eventElement.innerHTML = `Сейчас перемена между ${first_couple.couple_number} и <nobr>${second_couple.couple_number} парой</nobr>`;
            let time = this.calculateTime(second_couple.startTimeToSeconds() - currentTime);
            this.countdownElement.innerHTML = `До конца перемены ${time}`
        } else if (couple.lesson_1.endTimeToSeconds() <= currentTime && couple.lesson_2.startTimeToSeconds() >= currentTime) {
            this.eventElement.innerHTML = `Сейчас перемена между 1 и <nobr>2 уроком</nobr> <nobr>${couple.couple_number} пары</nobr>`;
            let time = this.calculateTime(couple.lesson_2.startTimeToSeconds() - currentTime);
            this.countdownElement.innerHTML = `До конца перемены ${time}`
        } else if (couple.endTimeToSeconds() <= currentTime && next_couple.startTimeToSeconds() >= currentTime) {
            this.eventElement.innerHTML = `Сейчас перемена между ${couple.couple_number} и <nobr>${next_couple.couple_number} парой</nobr>`;
            let time = this.calculateTime(next_couple.startTimeToSeconds() - currentTime);
            this.countdownElement.innerHTML = `До конца перемены ${time}`
        } else if (couple.lesson_1.startTimeToSeconds() <= currentTime && couple.lesson_1.endTimeToSeconds() >= currentTime) {
            this.eventElement.innerHTML = `Сейчас <nobr>1 урок</nobr> <nobr>${couple.couple_number} пары</nobr>`;
            let time = this.calculateTime(couple.lesson_1.endTimeToSeconds() - currentTime);
            this.countdownElement.innerHTML = `До конца урока ${time}`
        } else if (couple.lesson_2.startTimeToSeconds() <= currentTime && couple.lesson_2.endTimeToSeconds() >= currentTime) {
            this.eventElement.innerHTML = `Сейчас <nobr>2 урок</nobr> <nobr>${couple.couple_number} пары</nobr>`;
            let time = this.calculateTime(couple.lesson_2.endTimeToSeconds() - currentTime);
            this.countdownElement.innerHTML = `До конца урока ${time}`
        } else {
            console.error(`Ошибка при расчете. Текущее время: ${currentTime}, пара: ${couple}`);
        }
    }
}

const schedule = new Schedule();
