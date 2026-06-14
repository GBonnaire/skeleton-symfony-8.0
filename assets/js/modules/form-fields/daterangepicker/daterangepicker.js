/**
 * DateRangePicker — vanilla JS, aligned.
 * Based on Dan Grossman's daterangepicker v3.1 (MIT).
 */
import moment from 'moment';

// ─── DOM helpers ──────────────────────────────────────────────────────────────

function qs(root, sel)  { return root.querySelector(sel); }
function qsa(root, sel) { return Array.from(root.querySelectorAll(sel)); }

function elOffset(el) {
    var r = el.getBoundingClientRect();
    return { top: r.top + window.pageYOffset, left: r.left + window.pageXOffset };
}

function parseHtml(html) {
    var d = document.createElement('div');
    d.innerHTML = html.trim();
    return d.firstChild;
}

/**
 * Delegated event listener: fires handler when e.target.closest(sel) matches inside root.
 * Pushes the binding into `store` for later cleanup.
 */
function delegate(root, event, sel, handler, store) {
    var fn = function(e) {
        var t = e.target.closest(sel);
        if (t && root.contains(t)) handler.call(t, e);
    };
    root.addEventListener(event, fn);
    if (store) store.push({ el: root, event: event, fn: fn });
}

function trigger(el, name, detail) {
    el.dispatchEvent(new CustomEvent(name, { detail: detail, bubbles: true }));
}

function dataAttrs(el) {
    var obj = {};
    if (el.dataset) {
        for (var k in el.dataset) obj[k] = el.dataset[k];
    }
    return obj;
}

// ─── DateRangePicker ──────────────────────────────────────────────────────────

var DateRangePicker = function(element, options, cb) {
    if (typeof element === 'string') element = document.querySelector(element);

    this.element = element;
    this.parentEl = document.body;

    this.startDate = moment().startOf('day');
    this.endDate   = moment().endOf('day');
    this.minDate   = false;
    this.maxDate   = false;
    this.maxSpan   = false;
    this.autoApply = false;
    this.singleDatePicker     = false;
    this.showDropdowns        = false;
    this.minYear = moment().subtract(100, 'year').format('YYYY');
    this.maxYear = moment().add(100, 'year').format('YYYY');
    this.showWeekNumbers      = false;
    this.showISOWeekNumbers   = false;
    this.showCustomRangeLabel = true;
    this.timePicker           = false;
    this.timePicker24Hour     = false;
    this.timePickerIncrement  = 1;
    this.timePickerSeconds    = false;
    this.linkedCalendars      = true;
    this.autoUpdateInput      = true;
    this.alwaysShowCalendars  = false;
    this.ranges = {};

    this.opens = element.classList.contains('pull-right') ? 'left' : 'right';
    this.drops = element.classList.contains('dropup')     ? 'up'   : 'down';

    this.buttonClasses       = 'da-btn da-btn-sm';
    this.applyButtonClasses  = 'da-btn-primary';
    this.cancelButtonClasses = 'da-btn-outline';

    this.locale = {
        direction:       'ltr',
        format:          moment.localeData().longDateFormat('L'),
        separator:       ' - ',
        applyLabel:      'Appliquer',
        cancelLabel:     'Annuler',
        weekLabel:       'S',
        customRangeLabel: 'Période personnalisée',
        daysOfWeek:      moment.weekdaysMin(),
        monthNames:      moment.monthsShort(),
        firstDay:        moment.localeData().firstDayOfWeek()
    };

    this.callback  = function() {};
    this.isShowing = false;
    this.leftCalendar  = {};
    this.rightCalendar = {};

    this._listeners    = [];

    if (typeof options !== 'object' || options === null) options = {};
    options = Object.assign({}, dataAttrs(element), options);

    if (typeof options.template !== 'string')
        options.template =
            '<div class="daterangepicker">' +
                '<div class="ranges"></div>' +
                '<div class="drp-calendar left">' +
                    '<div class="calendar-table"></div>' +
                    '<div class="calendar-time"></div>' +
                '</div>' +
                '<div class="drp-calendar right">' +
                    '<div class="calendar-table"></div>' +
                    '<div class="calendar-time"></div>' +
                '</div>' +
                '<div class="drp-buttons">' +
                    '<span class="drp-selected"></span>' +
                    '<button class="cancelBtn" type="button"></button>' +
                    '<button class="applyBtn" disabled type="button"></button>' +
                '</div>' +
            '</div>';

    var parentElOpt = options.parentEl ? document.querySelector(options.parentEl) : null;
    if (parentElOpt) this.parentEl = parentElOpt;
    this.container = parseHtml(options.template);
    this.parentEl.appendChild(this.container);

    // ── locale ────────────────────────────────────────────────────────────────
    if (typeof options.locale === 'object') {
        var l = options.locale;
        if (typeof l.direction       === 'string') this.locale.direction       = l.direction;
        if (typeof l.format          === 'string') this.locale.format          = l.format;
        if (typeof l.separator       === 'string') this.locale.separator       = l.separator;
        if (typeof l.daysOfWeek      === 'object') this.locale.daysOfWeek      = l.daysOfWeek.slice();
        if (typeof l.monthNames      === 'object') this.locale.monthNames      = l.monthNames.slice();
        if (typeof l.firstDay        === 'number') this.locale.firstDay        = l.firstDay;
        if (typeof l.applyLabel      === 'string') this.locale.applyLabel      = l.applyLabel;
        if (typeof l.cancelLabel     === 'string') this.locale.cancelLabel     = l.cancelLabel;
        if (typeof l.weekLabel       === 'string') this.locale.weekLabel       = l.weekLabel;
        if (typeof l.customRangeLabel === 'string') {
            var ta = document.createElement('textarea');
            ta.innerHTML = l.customRangeLabel;
            this.locale.customRangeLabel = ta.value;
        }
    }
    this.container.classList.add(this.locale.direction);

    // ── date options ──────────────────────────────────────────────────────────
    if (typeof options.startDate === 'string') this.startDate = moment(options.startDate, this.locale.format);
    if (typeof options.endDate   === 'string') this.endDate   = moment(options.endDate,   this.locale.format);
    if (typeof options.minDate   === 'string') this.minDate   = moment(options.minDate,   this.locale.format);
    if (typeof options.maxDate   === 'string') this.maxDate   = moment(options.maxDate,   this.locale.format);
    if (typeof options.startDate === 'object') this.startDate = moment(options.startDate);
    if (typeof options.endDate   === 'object') this.endDate   = moment(options.endDate);
    if (typeof options.minDate   === 'object') this.minDate   = moment(options.minDate);
    if (typeof options.maxDate   === 'object') this.maxDate   = moment(options.maxDate);

    if (this.minDate && this.startDate.isBefore(this.minDate)) this.startDate = this.minDate.clone();
    if (this.maxDate && this.endDate.isAfter(this.maxDate))    this.endDate   = this.maxDate.clone();

    // ── other options ─────────────────────────────────────────────────────────
    if (typeof options.applyButtonClasses  === 'string') this.applyButtonClasses  = options.applyButtonClasses;
    if (typeof options.applyClass          === 'string') this.applyButtonClasses  = options.applyClass;
    if (typeof options.cancelButtonClasses === 'string') this.cancelButtonClasses = options.cancelButtonClasses;
    if (typeof options.cancelClass         === 'string') this.cancelButtonClasses = options.cancelClass;
    if (typeof options.maxSpan    === 'object')  this.maxSpan    = options.maxSpan;
    if (typeof options.dateLimit  === 'object')  this.maxSpan    = options.dateLimit;
    if (typeof options.opens      === 'string')  this.opens      = options.opens;
    if (typeof options.drops      === 'string')  this.drops      = options.drops;
    if (typeof options.showWeekNumbers      === 'boolean') this.showWeekNumbers      = options.showWeekNumbers;
    if (typeof options.showISOWeekNumbers   === 'boolean') this.showISOWeekNumbers   = options.showISOWeekNumbers;
    if (typeof options.buttonClasses        === 'string')  this.buttonClasses        = options.buttonClasses;
    if (typeof options.buttonClasses        === 'object')  this.buttonClasses        = options.buttonClasses.join(' ');
    if (typeof options.showDropdowns        === 'boolean') this.showDropdowns        = options.showDropdowns;
    if (typeof options.minYear              === 'number')  this.minYear              = options.minYear;
    if (typeof options.maxYear              === 'number')  this.maxYear              = options.maxYear;
    if (typeof options.showCustomRangeLabel === 'boolean') this.showCustomRangeLabel = options.showCustomRangeLabel;
    if (typeof options.singleDatePicker     === 'boolean') {
        this.singleDatePicker = options.singleDatePicker;
        if (this.singleDatePicker) this.endDate = this.startDate.clone();
    }
    if (typeof options.timePicker          === 'boolean') this.timePicker          = options.timePicker;
    if (typeof options.timePickerSeconds   === 'boolean') this.timePickerSeconds   = options.timePickerSeconds;
    if (typeof options.timePickerIncrement === 'number')  this.timePickerIncrement = options.timePickerIncrement;
    if (typeof options.timePicker24Hour    === 'boolean') this.timePicker24Hour    = options.timePicker24Hour;
    if (typeof options.autoApply           === 'boolean') this.autoApply           = options.autoApply;
    if (typeof options.autoUpdateInput     === 'boolean') this.autoUpdateInput     = options.autoUpdateInput;
    if (typeof options.linkedCalendars     === 'boolean') this.linkedCalendars     = options.linkedCalendars;
    if (typeof options.isInvalidDate       === 'function') this.isInvalidDate      = options.isInvalidDate;
    if (typeof options.isCustomDate        === 'function') this.isCustomDate       = options.isCustomDate;
    if (typeof options.alwaysShowCalendars === 'boolean') this.alwaysShowCalendars = options.alwaysShowCalendars;

    // rotate daysOfWeek to match firstDay
    if (this.locale.firstDay !== 0) {
        var i = this.locale.firstDay;
        while (i-- > 0) this.locale.daysOfWeek.push(this.locale.daysOfWeek.shift());
    }

    // read initial value from text input
    if (typeof options.startDate === 'undefined' && typeof options.endDate === 'undefined') {
        if (element.tagName === 'INPUT') {
            var val = element.value, parts = val.split(this.locale.separator);
            var s0 = null, e0 = null;
            if (parts.length === 2) {
                s0 = moment(parts[0], this.locale.format);
                e0 = moment(parts[1], this.locale.format);
            } else if (this.singleDatePicker && val !== '') {
                s0 = e0 = moment(val, this.locale.format);
            }
            if (s0 && e0) { this.setStartDate(s0); this.setEndDate(e0); }
        }
    }

    // build ranges list
    if (typeof options.ranges === 'object') {
        for (var range in options.ranges) {
            var rs = typeof options.ranges[range][0] === 'string'
                ? moment(options.ranges[range][0], this.locale.format)
                : moment(options.ranges[range][0]);
            var re = typeof options.ranges[range][1] === 'string'
                ? moment(options.ranges[range][1], this.locale.format)
                : moment(options.ranges[range][1]);

            if (this.minDate && rs.isBefore(this.minDate)) rs = this.minDate.clone();
            var rmax = this.maxDate;
            if (this.maxSpan && rmax && rs.clone().add(this.maxSpan).isAfter(rmax)) rmax = rs.clone().add(this.maxSpan);
            if (rmax && re.isAfter(rmax)) re = rmax.clone();
            if ((this.minDate && re.isBefore(this.minDate, this.timePicker ? 'minute' : 'day')) ||
                (rmax && rs.isAfter(rmax, this.timePicker ? 'minute' : 'day'))) continue;

            var ta2 = document.createElement('textarea');
            ta2.innerHTML = range;
            var rangeHtml = ta2.value;
            this.ranges[rangeHtml] = [rs, re];
        }

        var list = '<ul>';
        for (var r in this.ranges) list += '<li data-range-key="' + r + '">' + r + '</li>';
        if (this.showCustomRangeLabel)
            list += '<li data-range-key="' + this.locale.customRangeLabel + '">' + this.locale.customRangeLabel + '</li>';
        list += '</ul>';
        qs(this.container, '.ranges').insertAdjacentHTML('afterbegin', list);
    }

    if (typeof cb === 'function') this.callback = cb;

    if (!this.timePicker) {
        this.startDate = this.startDate.startOf('day');
        this.endDate   = this.endDate.endOf('day');
        qsa(this.container, '.calendar-time').forEach(function(el) { el.style.display = 'none'; });
    }
    if (this.timePicker && this.autoApply) this.autoApply = false;
    if (this.autoApply) this.container.classList.add('auto-apply');
    if (typeof options.ranges === 'object') this.container.classList.add('show-ranges');

    if (this.singleDatePicker) {
        this.container.classList.add('single');
        var leftCal = qs(this.container, '.drp-calendar.left');
        leftCal.classList.add('single');
        leftCal.style.display = 'block';
        qs(this.container, '.drp-calendar.right').style.display = 'none';
        if (!this.timePicker && this.autoApply) this.container.classList.add('auto-apply');
    }

    if ((typeof options.ranges === 'undefined' && !this.singleDatePicker) || this.alwaysShowCalendars)
        this.container.classList.add('show-calendar');

    this.container.classList.add('opens' + this.opens);

    // button classes & labels
    var self = this;
    var btnClasses = this.buttonClasses.split(' ');
    qsa(this.container, '.applyBtn, .cancelBtn').forEach(function(btn) {
        btnClasses.forEach(function(c) { if (c) btn.classList.add(c); });
    });
    if (this.applyButtonClasses.length)
        this.applyButtonClasses.split(' ').forEach(function(c) { if (c) qs(self.container, '.applyBtn').classList.add(c); });
    if (this.cancelButtonClasses.length)
        this.cancelButtonClasses.split(' ').forEach(function(c) { if (c) qs(self.container, '.cancelBtn').classList.add(c); });
    qs(this.container, '.applyBtn').innerHTML  = this.locale.applyLabel;
    qs(this.container, '.cancelBtn').innerHTML = this.locale.cancelLabel;

    // ── event listeners ───────────────────────────────────────────────────────
    var L = this._listeners;

    qsa(this.container, '.drp-calendar').forEach(function(cal) {
        delegate(cal, 'click',      '.prev',      self.clickPrev.bind(self), L);
        delegate(cal, 'click',      '.next',      self.clickNext.bind(self), L);
        delegate(cal, 'mousedown',  'td.available', self.clickDate.bind(self), L);
        delegate(cal, 'mouseenter', 'td.available', self.hoverDate.bind(self), L);
        delegate(cal, 'change',     'select.yearselect',  self.monthOrYearChanged.bind(self), L);
        delegate(cal, 'change',     'select.monthselect', self.monthOrYearChanged.bind(self), L);
        delegate(cal, 'change',
            'select.hourselect, select.minuteselect, select.secondselect, select.ampmselect',
            self.timeChanged.bind(self), L);
    });

    delegate(qs(this.container, '.ranges'),    'click', 'li',             self.clickRange.bind(self),  L);
    delegate(qs(this.container, '.drp-buttons'), 'click', 'button.applyBtn',  self.clickApply.bind(self),  L);
    delegate(qs(this.container, '.drp-buttons'), 'click', 'button.cancelBtn', self.clickCancel.bind(self), L);

    if (element.tagName === 'INPUT' || element.tagName === 'BUTTON') {
        var showFn    = self.show.bind(self);
        var keyupFn   = self.elementChanged.bind(self);
        var keydownFn = self.keydown.bind(self);
        element.addEventListener('click',   showFn);
        element.addEventListener('focus',   showFn);
        element.addEventListener('keyup',   keyupFn);
        element.addEventListener('keydown', keydownFn);
        L.push(
            { el: element, event: 'click',   fn: showFn },
            { el: element, event: 'focus',   fn: showFn },
            { el: element, event: 'keyup',   fn: keyupFn },
            { el: element, event: 'keydown', fn: keydownFn }
        );
    } else {
        var toggleFn = self.toggle.bind(self);
        element.addEventListener('click',   toggleFn);
        element.addEventListener('keydown', toggleFn);
        L.push(
            { el: element, event: 'click',   fn: toggleFn },
            { el: element, event: 'keydown', fn: toggleFn }
        );
    }

    this.updateElement();
};

DateRangePicker.prototype = {

    constructor: DateRangePicker,

    setStartDate: function(startDate) {
        if (typeof startDate === 'string') this.startDate = moment(startDate, this.locale.format);
        if (typeof startDate === 'object') this.startDate = moment(startDate);
        if (!this.timePicker) this.startDate = this.startDate.startOf('day');
        if (this.timePicker && this.timePickerIncrement)
            this.startDate.minute(Math.round(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
        if (this.minDate && this.startDate.isBefore(this.minDate)) {
            this.startDate = this.minDate.clone();
            if (this.timePicker && this.timePickerIncrement)
                this.startDate.minute(Math.round(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
        }
        if (this.maxDate && this.startDate.isAfter(this.maxDate)) {
            this.startDate = this.maxDate.clone();
            if (this.timePicker && this.timePickerIncrement)
                this.startDate.minute(Math.floor(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
        }
        if (!this.isShowing) this.updateElement();
        this.updateMonthsInView();
    },

    setEndDate: function(endDate) {
        if (typeof endDate === 'string') this.endDate = moment(endDate, this.locale.format);
        if (typeof endDate === 'object') this.endDate = moment(endDate);
        if (!this.timePicker) this.endDate = this.endDate.endOf('day');
        if (this.timePicker && this.timePickerIncrement)
            this.endDate.minute(Math.round(this.endDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
        if (this.endDate.isBefore(this.startDate)) this.endDate = this.startDate.clone();
        if (this.maxDate && this.endDate.isAfter(this.maxDate)) this.endDate = this.maxDate.clone();
        if (this.maxSpan && this.startDate.clone().add(this.maxSpan).isBefore(this.endDate))
            this.endDate = this.startDate.clone().add(this.maxSpan);
        this.previousRightTime = this.endDate.clone();
        qs(this.container, '.drp-selected').innerHTML =
            this.startDate.format(this.locale.format) + this.locale.separator + this.endDate.format(this.locale.format);
        if (!this.isShowing) this.updateElement();
        this.updateMonthsInView();
    },

    isInvalidDate: function() { return false; },
    isCustomDate:  function() { return false; },

    updateView: function() {
        if (this.timePicker) {
            this.renderTimePicker('left');
            this.renderTimePicker('right');
            var rightSelects = qsa(this.container, '.right .calendar-time select');
            if (!this.endDate) {
                rightSelects.forEach(function(s) { s.disabled = true; s.classList.add('disabled'); });
            } else {
                rightSelects.forEach(function(s) { s.disabled = false; s.classList.remove('disabled'); });
            }
        }
        if (this.endDate)
            qs(this.container, '.drp-selected').innerHTML =
                this.startDate.format(this.locale.format) + this.locale.separator + this.endDate.format(this.locale.format);
        this.updateMonthsInView();
        this.updateCalendars();
        this.updateFormInputs();
    },

    updateMonthsInView: function() {
        if (this.endDate) {
            if (!this.singleDatePicker && this.leftCalendar.month && this.rightCalendar.month &&
                (this.startDate.format('YYYY-MM') === this.leftCalendar.month.format('YYYY-MM') ||
                 this.startDate.format('YYYY-MM') === this.rightCalendar.month.format('YYYY-MM')) &&
                (this.endDate.format('YYYY-MM') === this.leftCalendar.month.format('YYYY-MM') ||
                 this.endDate.format('YYYY-MM') === this.rightCalendar.month.format('YYYY-MM'))) {
                return;
            }
            this.leftCalendar.month = this.startDate.clone().date(2);
            if (!this.linkedCalendars &&
                (this.endDate.month() !== this.startDate.month() || this.endDate.year() !== this.startDate.year())) {
                this.rightCalendar.month = this.endDate.clone().date(2);
            } else {
                this.rightCalendar.month = this.startDate.clone().date(2).add(1, 'month');
            }
        } else {
            if (this.leftCalendar.month.format('YYYY-MM') !== this.startDate.format('YYYY-MM') &&
                this.rightCalendar.month.format('YYYY-MM') !== this.startDate.format('YYYY-MM')) {
                this.leftCalendar.month  = this.startDate.clone().date(2);
                this.rightCalendar.month = this.startDate.clone().date(2).add(1, 'month');
            }
        }
        if (this.maxDate && this.linkedCalendars && !this.singleDatePicker &&
            this.rightCalendar.month > this.maxDate) {
            this.rightCalendar.month = this.maxDate.clone().date(2);
            this.leftCalendar.month  = this.maxDate.clone().date(2).subtract(1, 'month');
        }
    },

    updateCalendars: function() {
        if (this.timePicker) {
            var hour, minute, second;
            if (this.endDate) {
                hour   = parseInt(qs(this.container, '.left .hourselect').value, 10);
                minute = parseInt(qs(this.container, '.left .minuteselect').value, 10);
                if (isNaN(minute)) minute = parseInt(qs(this.container, '.left .minuteselect option:last-child').value, 10);
                second = this.timePickerSeconds ? parseInt(qs(this.container, '.left .secondselect').value, 10) : 0;
                if (!this.timePicker24Hour) {
                    var ampm = qs(this.container, '.left .ampmselect').value;
                    if (ampm === 'PM' && hour < 12) hour += 12;
                    if (ampm === 'AM' && hour === 12) hour = 0;
                }
            } else {
                hour   = parseInt(qs(this.container, '.right .hourselect').value, 10);
                minute = parseInt(qs(this.container, '.right .minuteselect').value, 10);
                if (isNaN(minute)) minute = parseInt(qs(this.container, '.right .minuteselect option:last-child').value, 10);
                second = this.timePickerSeconds ? parseInt(qs(this.container, '.right .secondselect').value, 10) : 0;
                if (!this.timePicker24Hour) {
                    var ampm = qs(this.container, '.right .ampmselect').value;
                    if (ampm === 'PM' && hour < 12) hour += 12;
                    if (ampm === 'AM' && hour === 12) hour = 0;
                }
            }
            this.leftCalendar.month.hour(hour).minute(minute).second(second);
            this.rightCalendar.month.hour(hour).minute(minute).second(second);
        }

        this.renderCalendar('left');
        this.renderCalendar('right');

        qsa(this.container, '.ranges li').forEach(function(li) { li.classList.remove('active'); });
        if (this.endDate === null) return;
        this.calculateChosenLabel();
    },

    renderCalendar: function(side) {
        var calendar = side === 'left' ? this.leftCalendar : this.rightCalendar;
        var month    = calendar.month.month();
        var year     = calendar.month.year();
        var hour     = calendar.month.hour();
        var minute   = calendar.month.minute();
        var second   = calendar.month.second();
        var daysInMonth     = moment([year, month]).daysInMonth();
        var firstDay        = moment([year, month, 1]);
        var lastDay         = moment([year, month, daysInMonth]);
        var lastMonth       = moment(firstDay).subtract(1, 'month').month();
        var lastYear        = moment(firstDay).subtract(1, 'month').year();
        var daysInLastMonth = moment([lastYear, lastMonth]).daysInMonth();
        var dayOfWeek       = firstDay.day();

        var cal = [];
        cal.firstDay = firstDay;
        cal.lastDay  = lastDay;
        for (var i = 0; i < 6; i++) cal[i] = [];

        var startDay = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1;
        if (startDay > daysInLastMonth) startDay -= 7;
        if (dayOfWeek === this.locale.firstDay) startDay = daysInLastMonth - 6;

        var curDate = moment([lastYear, lastMonth, startDay, 12, minute, second]);
        for (var i = 0, col = 0, row = 0; i < 42; i++, col++, curDate = moment(curDate).add(24, 'hour')) {
            if (i > 0 && col % 7 === 0) { col = 0; row++; }
            cal[row][col] = curDate.clone().hour(hour).minute(minute).second(second);
            curDate.hour(12);
            if (this.minDate && cal[row][col].format('YYYY-MM-DD') === this.minDate.format('YYYY-MM-DD') &&
                cal[row][col].isBefore(this.minDate) && side === 'left') {
                cal[row][col] = this.minDate.clone();
            }
            if (this.maxDate && cal[row][col].format('YYYY-MM-DD') === this.maxDate.format('YYYY-MM-DD') &&
                cal[row][col].isAfter(this.maxDate) && side === 'right') {
                cal[row][col] = this.maxDate.clone();
            }
        }

        if (side === 'left') this.leftCalendar.calendar  = cal;
        else                 this.rightCalendar.calendar = cal;

        var minDate  = side === 'left' ? this.minDate : this.startDate;
        var maxDate  = this.maxDate;
        var arrow    = this.locale.direction === 'ltr'
            ? { left: 'chevron-left', right: 'chevron-right' }
            : { left: 'chevron-right', right: 'chevron-left' };

        var html = '<table class="table-condensed"><thead><tr>';

        if (this.showWeekNumbers || this.showISOWeekNumbers) html += '<th></th>';

        if ((!minDate || minDate.isBefore(cal.firstDay)) && (!this.linkedCalendars || side === 'left')) {
            html += '<th class="prev available"><span></span></th>';
        } else {
            html += '<th></th>';
        }

        var dateHtml = this.locale.monthNames[cal[1][1].month()] + cal[1][1].format(' YYYY');

        if (this.showDropdowns) {
            var currentMonth = cal[1][1].month();
            var currentYear  = cal[1][1].year();
            var maxYear      = (maxDate && maxDate.year()) || this.maxYear;
            var minYear      = (minDate && minDate.year()) || this.minYear;
            var inMinYear    = currentYear == minYear;
            var inMaxYear    = currentYear == maxYear;

            var monthHtml = '<select class="monthselect">';
            for (var m = 0; m < 12; m++) {
                if ((!inMinYear || (minDate && m >= minDate.month())) && (!inMaxYear || (maxDate && m <= maxDate.month()))) {
                    monthHtml += "<option value='" + m + "'" + (m === currentMonth ? " selected" : '') + '>' + this.locale.monthNames[m] + '</option>';
                } else {
                    monthHtml += "<option value='" + m + "'" + (m === currentMonth ? " selected" : '') + " disabled>" + this.locale.monthNames[m] + '</option>';
                }
            }
            monthHtml += '</select>';

            var yearHtml = '<select class="yearselect">';
            for (var y = minYear; y <= maxYear; y++) {
                yearHtml += '<option value="' + y + '"' + (y === currentYear ? ' selected' : '') + '>' + y + '</option>';
            }
            yearHtml += '</select>';
            dateHtml = monthHtml + yearHtml;
        }

        html += '<th colspan="5" class="month">' + dateHtml + '</th>';

        if ((!maxDate || maxDate.isAfter(cal.lastDay)) && (!this.linkedCalendars || side === 'right' || this.singleDatePicker)) {
            html += '<th class="next available"><span></span></th>';
        } else {
            html += '<th></th>';
        }

        html += '</tr><tr>';
        if (this.showWeekNumbers || this.showISOWeekNumbers) html += '<th class="week">' + this.locale.weekLabel + '</th>';
        this.locale.daysOfWeek.forEach(function(d) { html += '<th>' + d + '</th>'; });
        html += '</tr></thead><tbody>';

        if (this.endDate === null && this.maxSpan) {
            var maxLimit = this.startDate.clone().add(this.maxSpan).endOf('day');
            if (!maxDate || maxLimit.isBefore(maxDate)) maxDate = maxLimit;
        }

        for (var row = 0; row < 6; row++) {
            html += '<tr>';
            if (this.showWeekNumbers)
                html += '<td class="week">' + cal[row][0].week() + '</td>';
            else if (this.showISOWeekNumbers)
                html += '<td class="week">' + cal[row][0].isoWeek() + '</td>';

            for (var col = 0; col < 7; col++) {
                var classes = [];
                if (cal[row][col].isSame(new Date(), 'day')) classes.push('today');
                if (cal[row][col].isoWeekday() > 5)          classes.push('weekend');
                if (cal[row][col].month() !== cal[1][1].month()) classes.push('off', 'ends');
                if (this.minDate && cal[row][col].isBefore(this.minDate, 'day')) classes.push('off', 'disabled');
                if (maxDate && cal[row][col].isAfter(maxDate, 'day'))            classes.push('off', 'disabled');
                if (this.isInvalidDate(cal[row][col]))                           classes.push('off', 'disabled');
                if (cal[row][col].format('YYYY-MM-DD') === this.startDate.format('YYYY-MM-DD')) classes.push('active', 'start-date');
                if (this.endDate !== null && cal[row][col].format('YYYY-MM-DD') === this.endDate.format('YYYY-MM-DD')) classes.push('active', 'end-date');
                if (this.endDate !== null && cal[row][col] > this.startDate && cal[row][col] < this.endDate) classes.push('in-range');

                var isCustom = this.isCustomDate(cal[row][col]);
                if (isCustom !== false) {
                    if (typeof isCustom === 'string') classes.push(isCustom);
                    else Array.prototype.push.apply(classes, isCustom);
                }

                var cname = '', disabled = false;
                for (var k = 0; k < classes.length; k++) {
                    cname += classes[k] + ' ';
                    if (classes[k] === 'disabled') disabled = true;
                }
                if (!disabled) cname += 'available';
                html += '<td class="' + cname.trim() + '" data-title="r' + row + 'c' + col + '">' + cal[row][col].date() + '</td>';
            }
            html += '</tr>';
        }

        html += '</tbody></table>';
        qs(this.container, '.drp-calendar.' + side + ' .calendar-table').innerHTML = html;
    },

    renderTimePicker: function(side) {
        if (side === 'right' && !this.endDate) return;

        var html, selected, minDate, maxDate = this.maxDate;
        if (this.maxSpan && (!this.maxDate || this.startDate.clone().add(this.maxSpan).isBefore(this.maxDate)))
            maxDate = this.startDate.clone().add(this.maxSpan);

        if (side === 'left') {
            selected = this.startDate.clone();
            minDate  = this.minDate;
        } else {
            selected = this.endDate.clone();
            minDate  = this.startDate;

            var timeSelector = qs(this.container, '.drp-calendar.right .calendar-time');
            if (timeSelector.innerHTML !== '') {
                var hSel  = qs(timeSelector, '.hourselect option:checked');
                var mSel  = qs(timeSelector, '.minuteselect option:checked');
                var sSel  = qs(timeSelector, '.secondselect option:checked');
                var apSel = qs(timeSelector, '.ampmselect option:checked');
                selected.hour(!isNaN(selected.hour())     ? selected.hour()   : (hSel  ? hSel.value  : 0));
                selected.minute(!isNaN(selected.minute()) ? selected.minute() : (mSel  ? mSel.value  : 0));
                selected.second(!isNaN(selected.second()) ? selected.second() : (sSel  ? sSel.value  : 0));
                if (!this.timePicker24Hour && apSel) {
                    var apval = apSel.value;
                    if (apval === 'PM' && selected.hour() < 12)  selected.hour(selected.hour() + 12);
                    if (apval === 'AM' && selected.hour() === 12) selected.hour(0);
                }
            }
            if (selected.isBefore(this.startDate)) selected = this.startDate.clone();
            if (maxDate && selected.isAfter(maxDate)) selected = maxDate.clone();
        }

        html = '<select class="hourselect">';
        var start = this.timePicker24Hour ? 0 : 1;
        var end   = this.timePicker24Hour ? 23 : 12;
        for (var i = start; i <= end; i++) {
            var i24 = i;
            if (!this.timePicker24Hour)
                i24 = selected.hour() >= 12 ? (i === 12 ? 12 : i + 12) : (i === 12 ? 0 : i);
            var t   = selected.clone().hour(i24);
            var dis = (minDate && t.minute(59).isBefore(minDate)) || (maxDate && t.minute(0).isAfter(maxDate));
            if (i24 === selected.hour() && !dis)
                html += '<option value="' + i + '" selected>' + i + '</option>';
            else if (dis)
                html += '<option value="' + i + '" disabled class="disabled">' + i + '</option>';
            else
                html += '<option value="' + i + '">' + i + '</option>';
        }
        html += '</select> ';

        html += ': <select class="minuteselect">';
        for (var i = 0; i < 60; i += this.timePickerIncrement) {
            var padded = i < 10 ? '0' + i : i;
            var t   = selected.clone().minute(i);
            var dis = (minDate && t.second(59).isBefore(minDate)) || (maxDate && t.second(0).isAfter(maxDate));
            if (selected.minute() === i && !dis)
                html += '<option value="' + i + '" selected>' + padded + '</option>';
            else if (dis)
                html += '<option value="' + i + '" disabled class="disabled">' + padded + '</option>';
            else
                html += '<option value="' + i + '">' + padded + '</option>';
        }
        html += '</select> ';

        if (this.timePickerSeconds) {
            html += ': <select class="secondselect">';
            for (var i = 0; i < 60; i++) {
                var padded = i < 10 ? '0' + i : i;
                var t   = selected.clone().second(i);
                var dis = (minDate && t.isBefore(minDate)) || (maxDate && t.isAfter(maxDate));
                if (selected.second() === i && !dis)
                    html += '<option value="' + i + '" selected>' + padded + '</option>';
                else if (dis)
                    html += '<option value="' + i + '" disabled class="disabled">' + padded + '</option>';
                else
                    html += '<option value="' + i + '">' + padded + '</option>';
            }
            html += '</select> ';
        }

        if (!this.timePicker24Hour) {
            html += '<select class="ampmselect">';
            var am_attr = (minDate && selected.clone().hour(12).minute(0).second(0).isBefore(minDate))
                ? ' disabled class="disabled"' : '';
            var pm_attr = (maxDate && selected.clone().hour(0).minute(0).second(0).isAfter(maxDate))
                ? ' disabled class="disabled"' : '';
            if (selected.hour() >= 12) {
                html += '<option value="AM"' + am_attr + '>AM</option><option value="PM" selected' + pm_attr + '>PM</option>';
            } else {
                html += '<option value="AM" selected' + am_attr + '>AM</option><option value="PM"' + pm_attr + '>PM</option>';
            }
            html += '</select>';
        }

        qs(this.container, '.drp-calendar.' + side + ' .calendar-time').innerHTML = html;
    },

    updateFormInputs: function() {
        var applyBtn = qs(this.container, 'button.applyBtn');
        if (this.singleDatePicker ||
            (this.endDate && (this.startDate.isBefore(this.endDate) || this.startDate.isSame(this.endDate)))) {
            applyBtn.disabled = false;
        } else {
            applyBtn.disabled = true;
        }
    },

    move: function() {
        var parentOffset = { top: 0, left: 0 }, drops = this.drops;
        var parentRightEdge = window.innerWidth;

        if (this.parentEl !== document.body) {
            parentOffset = {
                top:  elOffset(this.parentEl).top  - this.parentEl.scrollTop,
                left: elOffset(this.parentEl).left - this.parentEl.scrollLeft
            };
            parentRightEdge = this.parentEl.clientWidth + elOffset(this.parentEl).left;
        }

        var containerTop;
        switch (drops) {
            case 'auto':
                containerTop = elOffset(this.element).top + this.element.offsetHeight - parentOffset.top;
                if (containerTop + this.container.offsetHeight >= this.parentEl.scrollHeight) {
                    containerTop = elOffset(this.element).top - this.container.offsetHeight - parentOffset.top;
                    drops = 'up';
                }
                break;
            case 'up':
                containerTop = elOffset(this.element).top - this.container.offsetHeight - parentOffset.top;
                break;
            default:
                containerTop = elOffset(this.element).top + this.element.offsetHeight - parentOffset.top;
        }

        this.container.style.top   = '0';
        this.container.style.left  = '0';
        this.container.style.right = 'auto';
        var containerWidth = this.container.offsetWidth;

        this.container.classList.toggle('drop-up', drops === 'up');

        if (this.opens === 'left') {
            var containerRight = parentRightEdge - elOffset(this.element).left - this.element.offsetWidth;
            if (containerWidth + containerRight > window.innerWidth) {
                Object.assign(this.container.style, { top: containerTop + 'px', right: 'auto', left: '9px' });
            } else {
                Object.assign(this.container.style, { top: containerTop + 'px', right: containerRight + 'px', left: 'auto' });
            }
        } else if (this.opens === 'center') {
            var cLeft = elOffset(this.element).left - parentOffset.left + this.element.offsetWidth / 2 - containerWidth / 2;
            if (cLeft < 0) {
                Object.assign(this.container.style, { top: containerTop + 'px', right: 'auto', left: '9px' });
            } else if (cLeft + containerWidth > window.innerWidth) {
                Object.assign(this.container.style, { top: containerTop + 'px', left: 'auto', right: '0' });
            } else {
                Object.assign(this.container.style, { top: containerTop + 'px', left: cLeft + 'px', right: 'auto' });
            }
        } else {
            var cLeft = elOffset(this.element).left - parentOffset.left;
            if (cLeft + containerWidth > window.innerWidth) {
                Object.assign(this.container.style, { top: containerTop + 'px', left: 'auto', right: '0' });
            } else {
                Object.assign(this.container.style, { top: containerTop + 'px', left: cLeft + 'px', right: 'auto' });
            }
        }
    },

    show: function(e) {
        if (this.isShowing) return;
        var self = this;
        this._outsideClickProxy = function(e) { self.outsideClick(e); };
        this._resizeProxy       = function(e) { self.move(e); };

        document.addEventListener('mousedown', this._outsideClickProxy);
        document.addEventListener('touchend',  this._outsideClickProxy);
        document.addEventListener('focusin',   this._outsideClickProxy);
        window.addEventListener('resize', this._resizeProxy);

        this.oldStartDate      = this.startDate.clone();
        this.oldEndDate        = this.endDate.clone();
        this.previousRightTime = this.endDate.clone();

        this.updateView();
        this.container.style.display = 'block';
        this.move();
        trigger(this.element, 'show.daterangepicker', this);
        this.isShowing = true;
    },

    hide: function(e) {
        if (!this.isShowing) return;
        if (!this.endDate) {
            this.startDate = this.oldStartDate.clone();
            this.endDate   = this.oldEndDate.clone();
        }
        if (this._applying || !this.startDate.isSame(this.oldStartDate) || !this.endDate.isSame(this.oldEndDate))
            this.callback(this.startDate.clone(), this.endDate.clone(), this.chosenLabel);

        this.updateElement();
        document.removeEventListener('mousedown', this._outsideClickProxy);
        document.removeEventListener('touchend',  this._outsideClickProxy);
        document.removeEventListener('focusin',   this._outsideClickProxy);
        window.removeEventListener('resize', this._resizeProxy);
        this.container.style.display = 'none';
        trigger(this.element, 'hide.daterangepicker', this);
        this.isShowing = false;
    },

    toggle: function(e) {
        if (this.isShowing) this.hide(); else this.show();
    },

    outsideClick: function(e) {
        if (e.type === 'focusin') return;
        if (this.element.contains(e.target)) return;
        if (this.container.contains(e.target)) return;
        if (e.target.closest && e.target.closest('.calendar-table')) return;
        this.hide();
        trigger(this.element, 'outsideClick.daterangepicker', this);
    },

    showCalendars: function() {
        this.container.classList.add('show-calendar');
        this.move();
        trigger(this.element, 'showCalendar.daterangepicker', this);
    },

    hideCalendars: function() {
        this.container.classList.remove('show-calendar');
        trigger(this.element, 'hideCalendar.daterangepicker', this);
    },

    clickRange: function(e) {
        var li    = e.target.closest('[data-range-key]');
        var label = li ? li.getAttribute('data-range-key') : null;
        if (!label) return;
        this.chosenLabel = label;
        if (label === this.locale.customRangeLabel) {
            this.showCalendars();
        } else {
            var dates = this.ranges[label];
            this.startDate = dates[0];
            this.endDate   = dates[1];
            if (!this.timePicker) {
                this.startDate.startOf('day');
                this.endDate.endOf('day');
            }
            if (!this.alwaysShowCalendars) this.hideCalendars();
            this.clickApply();
        }
    },

    clickPrev: function(e) {
        var cal = e.target.closest('.drp-calendar');
        if (cal.classList.contains('left')) {
            this.leftCalendar.month.subtract(1, 'month');
            if (this.linkedCalendars) this.rightCalendar.month.subtract(1, 'month');
        } else {
            this.rightCalendar.month.subtract(1, 'month');
        }
        this.updateCalendars();
    },

    clickNext: function(e) {
        var cal = e.target.closest('.drp-calendar');
        if (cal.classList.contains('left')) {
            this.leftCalendar.month.add(1, 'month');
        } else {
            this.rightCalendar.month.add(1, 'month');
            if (this.linkedCalendars) this.leftCalendar.month.add(1, 'month');
        }
        this.updateCalendars();
    },

    hoverDate: function(e) {
        if (!e.target.classList.contains('available')) return;
        var title = e.target.getAttribute('data-title');
        var row   = title.substr(1, 1), col = title.substr(3, 1);
        var cal   = e.target.closest('.drp-calendar');
        var date  = cal.classList.contains('left')
            ? this.leftCalendar.calendar[row][col]
            : this.rightCalendar.calendar[row][col];

        if (!this.endDate) {
            var lCal = this.leftCalendar, rCal = this.rightCalendar, sd = this.startDate;
            qsa(this.container, '.drp-calendar tbody td').forEach(function(td) {
                if (td.classList.contains('week')) return;
                var t  = td.getAttribute('data-title');
                var r  = t.substr(1, 1), c = t.substr(3, 1);
                var p  = td.closest('.drp-calendar');
                var dt = p.classList.contains('left') ? lCal.calendar[r][c] : rCal.calendar[r][c];
                if ((dt.isAfter(sd) && dt.isBefore(date)) || dt.isSame(date, 'day')) {
                    td.classList.add('in-range');
                } else {
                    td.classList.remove('in-range');
                }
            });
        }
    },

    clickDate: function(e) {
        if (!e.target.classList.contains('available')) return;
        var title = e.target.getAttribute('data-title');
        var row   = title.substr(1, 1), col = title.substr(3, 1);
        var cal   = e.target.closest('.drp-calendar');
        var date  = cal.classList.contains('left')
            ? this.leftCalendar.calendar[row][col]
            : this.rightCalendar.calendar[row][col];

        if (this.endDate || date.isBefore(this.startDate, 'day')) {
            if (this.timePicker) {
                var hour = parseInt(qs(this.container, '.left .hourselect').value, 10);
                if (!this.timePicker24Hour) {
                    var ampm = qs(this.container, '.left .ampmselect').value;
                    if (ampm === 'PM' && hour < 12) hour += 12;
                    if (ampm === 'AM' && hour === 12) hour = 0;
                }
                var minute = parseInt(qs(this.container, '.left .minuteselect').value, 10);
                if (isNaN(minute)) minute = parseInt(qs(this.container, '.left .minuteselect option:last-child').value, 10);
                var second = this.timePickerSeconds ? parseInt(qs(this.container, '.left .secondselect').value, 10) : 0;
                date = date.clone().hour(hour).minute(minute).second(second);
            }
            this.endDate = null;
            this.setStartDate(date.clone());
        } else if (!this.endDate && date.isBefore(this.startDate)) {
            this.setEndDate(this.startDate.clone());
        } else {
            if (this.timePicker) {
                var hour = parseInt(qs(this.container, '.right .hourselect').value, 10);
                if (!this.timePicker24Hour) {
                    var ampm = qs(this.container, '.right .ampmselect').value;
                    if (ampm === 'PM' && hour < 12) hour += 12;
                    if (ampm === 'AM' && hour === 12) hour = 0;
                }
                var minute = parseInt(qs(this.container, '.right .minuteselect').value, 10);
                if (isNaN(minute)) minute = parseInt(qs(this.container, '.right .minuteselect option:last-child').value, 10);
                var second = this.timePickerSeconds ? parseInt(qs(this.container, '.right .secondselect').value, 10) : 0;
                date = date.clone().hour(hour).minute(minute).second(second);
            }
            this.setEndDate(date.clone());
            if (this.autoApply) { this.calculateChosenLabel(); this.clickApply(); }
        }

        if (this.singleDatePicker) {
            this.setEndDate(this.startDate);
            if (!this.timePicker && this.autoApply) this.clickApply();
        }
        this.updateView();
        e.stopPropagation();
    },

    calculateChosenLabel: function() {
        var customRange = true, i = 0;
        for (var range in this.ranges) {
            var fmt = this.timePickerSeconds ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD HH:mm';
            var matched = this.timePicker
                ? (this.startDate.format(fmt) === this.ranges[range][0].format(fmt) &&
                   this.endDate.format(fmt)   === this.ranges[range][1].format(fmt))
                : (this.startDate.format('YYYY-MM-DD') === this.ranges[range][0].format('YYYY-MM-DD') &&
                   this.endDate.format('YYYY-MM-DD')   === this.ranges[range][1].format('YYYY-MM-DD'));
            if (matched) {
                customRange = false;
                var li = qsa(this.container, '.ranges li')[i];
                if (li) { li.classList.add('active'); this.chosenLabel = li.getAttribute('data-range-key'); }
                break;
            }
            i++;
        }
        if (customRange) {
            if (this.showCustomRangeLabel) {
                var lis   = qsa(this.container, '.ranges li');
                var lastLi = lis[lis.length - 1];
                if (lastLi) { lastLi.classList.add('active'); this.chosenLabel = lastLi.getAttribute('data-range-key'); }
            } else {
                this.chosenLabel = null;
            }
            this.showCalendars();
        }
    },

    clickApply: function(e) {
        this._applying = true;
        this.hide();
        this._applying = false;
        trigger(this.element, 'apply.daterangepicker', this);
    },

    clickCancel: function(e) {
        this.startDate = this.oldStartDate;
        this.endDate   = this.oldEndDate;
        this.hide();
        trigger(this.element, 'cancel.daterangepicker', this);
    },

    monthOrYearChanged: function(e) {
        var cal    = e.target.closest('.drp-calendar');
        var isLeft = cal.classList.contains('left');
        var month  = parseInt(qs(cal, '.monthselect').value, 10);
        var year   = parseInt(qs(cal, '.yearselect').value, 10);

        if (!isLeft) {
            if (year < this.startDate.year() || (year === this.startDate.year() && month < this.startDate.month())) {
                month = this.startDate.month();
                year  = this.startDate.year();
            }
        }
        if (this.minDate) {
            if (year < this.minDate.year() || (year === this.minDate.year() && month < this.minDate.month())) {
                month = this.minDate.month();
                year  = this.minDate.year();
            }
        }
        if (this.maxDate) {
            if (year > this.maxDate.year() || (year === this.maxDate.year() && month > this.maxDate.month())) {
                month = this.maxDate.month();
                year  = this.maxDate.year();
            }
        }
        if (isLeft) {
            this.leftCalendar.month.month(month).year(year);
            if (this.linkedCalendars) this.rightCalendar.month = this.leftCalendar.month.clone().add(1, 'month');
        } else {
            this.rightCalendar.month.month(month).year(year);
            if (this.linkedCalendars) this.leftCalendar.month = this.rightCalendar.month.clone().subtract(1, 'month');
        }
        this.updateCalendars();
    },

    timeChanged: function(e) {
        var cal    = e.target.closest('.drp-calendar');
        var isLeft = cal.classList.contains('left');
        var hour   = parseInt(qs(cal, '.hourselect').value, 10);
        var minute = parseInt(qs(cal, '.minuteselect').value, 10);
        if (isNaN(minute)) minute = parseInt(qs(cal, '.minuteselect option:last-child').value, 10);
        var second = this.timePickerSeconds ? parseInt(qs(cal, '.secondselect').value, 10) : 0;

        if (!this.timePicker24Hour) {
            var ampm = qs(cal, '.ampmselect').value;
            if (ampm === 'PM' && hour < 12) hour += 12;
            if (ampm === 'AM' && hour === 12) hour = 0;
        }

        if (isLeft) {
            var start = this.startDate.clone().hour(hour).minute(minute).second(second);
            this.setStartDate(start);
            if (this.singleDatePicker) {
                this.endDate = this.startDate.clone();
            } else if (this.endDate &&
                this.endDate.format('YYYY-MM-DD') === start.format('YYYY-MM-DD') &&
                this.endDate.isBefore(start)) {
                this.setEndDate(start.clone());
            }
        } else if (this.endDate) {
            this.setEndDate(this.endDate.clone().hour(hour).minute(minute).second(second));
        }
        this.updateCalendars();
        this.updateFormInputs();
        this.renderTimePicker('left');
        this.renderTimePicker('right');
    },

    elementChanged: function() {
        var el = this.element;
        if (el.tagName !== 'INPUT' || !el.value.length) return;
        var parts = el.value.split(this.locale.separator);
        var start = null, end = null;
        if (parts.length === 2) {
            start = moment(parts[0], this.locale.format);
            end   = moment(parts[1], this.locale.format);
        }
        if (this.singleDatePicker || !start || !end) {
            start = end = moment(el.value, this.locale.format);
        }
        if (!start.isValid() || !end.isValid()) return;
        this.setStartDate(start);
        this.setEndDate(end);
        this.updateView();
    },

    keydown: function(e) {
        if (e.keyCode === 9 || e.keyCode === 13) this.hide();
        if (e.keyCode === 27) { e.preventDefault(); e.stopPropagation(); this.hide(); }
    },

    updateElement: function() {
        var el = this.element;
        if (el.tagName === 'INPUT' && this.autoUpdateInput) {
            var newValue = this.startDate.format(this.locale.format);
            if (!this.singleDatePicker)
                newValue += this.locale.separator + this.endDate.format(this.locale.format);
            if (newValue !== el.value) {
                el.value = newValue;
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    },

    remove: function() {
        this.container.remove();
        this._listeners.forEach(function(item) {
            item.el.removeEventListener(item.event, item.fn);
        });
        this._listeners = [];
        delete this.element._daterangepicker;
    }

};

/**
 * Initialize one or more elements.
 * Replaces the jQuery $.fn.daterangepicker plugin.
 *
 * Usage:
 *   DateRangePicker.init('#my-input', options, callback);
 *   DateRangePicker.init(document.querySelectorAll('.drp'), options);
 */
DateRangePicker.init = function(elements, options, callback) {
    if (typeof elements === 'string') elements = document.querySelectorAll(elements);
    if (elements instanceof Element)  elements = [elements];
    Array.from(elements).forEach(function(el) {
        if (el._daterangepicker) el._daterangepicker.remove();
        el._daterangepicker = new DateRangePicker(el, Object.assign({}, options), callback);
    });
};

export default DateRangePicker;
