//month 0-11
//year 4 digits
function MonthGraph(month, year) {
   this._month = MonthGraph._Validate.Month(month);
   this._year = MonthGraph._Validate.Year(year);

   this._firstOfMonth = new Date(this._year, this._month, 1);
   this._lastOfMonth = new Date(this._year, this._month + 1, 0); //Yes, this works. Even for December.

   var firstInGridOffset = this._firstOfMonth.getDay() == 0 ? -6 : -this._firstOfMonth.getDay() + 1;
   this._firstInGrid = new Date(this._year, this._month, firstInGridOffset);
   var lastInGridOffset = 41;
   this._lastInGrid = new Date(this._year, this._month, firstInGridOffset + lastInGridOffset);

   this._uid = MonthGraph._Generate.Uid();
   this._stringId = MonthGraph._Generate.StringId(this._month, this._year, this._uid);

   this._createGraphElements();
}

MonthGraph.prototype = {
   _month: 0,
   _year: 0,

   _firstOfMonth: null,
   _lastOfMonth: null,
   _firstInGrid: null,
   _lastInGrid: null,

   _uid: 0,
   _stringId: "",

   _rootNode: null,
   _data: null,

   addPoint: function MonthGraph$addPoint(date) {

   },

   getRootNode: function MonthGraph$getRootNode() {
      return this._rootNode;
   },

   dateInGrid: function MonthGraph$dateInGrid(date) {
      return this._firstInGrid <= date && date <= this._lastInGrid;
   },

   dateInMonth: function MonthGraph$dateInMonth(date) {
      return this._firstOfMonth <= date && date <= this._lastOfMonth;
   },

   _gridToDate: function MonthGraph$_gridToDate(week, day) {
      if(!isFinite(week) || week < 0 || week > 5 || !isFinite(day) || day < 0 || day > 6) {
         return null;
      }

      var date = new Date(this._firstInGrid);
      date.setDate(date.getDate() + (week * 7 + day));
      return date;
   },

   _dateToGrid: function MonthGraph$_dateToGrid(date) {
      if(!this.dateInGrid(date)) {
         return null;
      }

      var offset = Math.floor((date - this._firstInGrid) / 86400000);
      var weeks = Math.floor(offset / 7);
      var days = offset % 7;
      return { "weeks": weeks, "days": days };
   },

/*** potentially obsolete with addition of _{first, last}{InGrid, OfMonth} fields
 *
 *   _calculateDayPositions: function MonthGraph$_calculateDayPositions() {
 *      //rows: weeks
 *      //cols: days of week
 *      this._dayGrid = MonthGraph._CreateDayGrid();
 *
 *      var dateCounter = new Date(this._firstOfMonth);
 *
 *      if(dateCounter.getDay() == 0) {
 *         var week = 1; //display a full week of the previous month if the first of this month is a Sunday
 *      } else {
 *         var week = 0;
 *      }
 *
 *      var day = dateCounter.getDay();
 *
 *      for(; dateCounter.getMonth() == this._month; dateCounter.setDate(dateCounter.getDate() + 1), day = (day + 1) % 7) {
 *         this._dayGrid[week][day] = 1;
 *
 *         if(day == 6) {
 *            week++;
 *         }
 *      }
 *   },
 */

   _createGraphElements: function MonthGraph$_createGraphElements() {
      this._rootNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

      this._rootNode.setAttribute('width', '135');
      this._rootNode.setAttribute('height', '115');

      var dayColumns = [];
      for(var i = 0; i < 7; i++) {
         dayColumns[i] = document.createElementNS('http://www.w3.org/2000/svg', 'g');

         dayColumns[i].setAttribute('transform', 'translate(' + (20 * i) + ')');

         var dayCells = [];

         for(var j = 0; j < 6; j++) {
            dayCells[j] = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

            dayCells[j].setAttribute('width', '15');
            dayCells[j].setAttribute('height', '15');

            dayCells[j].setAttribute('x', 1);
            dayCells[j].setAttribute('y', 20 * j);

            if(this.dateInMonth(this._gridToDate(j, i))) {
               dayCells[j].setAttribute('fill', '#aaa');
            } else {
               dayCells[j].setAttribute('fill', '#eee');
            }

            dayCells[j].addEventListener('mouseover', MonthGraph._Events.CellHover);
            dayCells[j].addEventListener('mouseout', MonthGraph._Events.CellUnHover);

            dayColumns[i].appendChild(dayCells[j]);
         }

         this._rootNode.appendChild(dayColumns[i]);
      }
   }
};

MonthGraph._Validate = {
   Month: function MonthGraph$_Validate$Month(month) {
      if(isFinite(month) && month >= 0 && month <= 11) {
         return month;
      } else {
         return new Date().getMonth();
      }
   },

   Year: function MonthGraph$_Validate$Year(year) {
      if(isFinite(year)) {
         return year;
      } else {
         return new Date().getFullYear();
      }
   }
};

MonthGraph._Generate = {
   Uid: function MonthGraph$_Generate$Uid() {
      return new Date().getTime();
   },

   StringId: function MonthGraph$_Generate$StringId(month, year, uid) {
      return MonthGraph.Months[month] + year + '-' + uid;
   }
};

MonthGraph._CreateDayGrid = function MonthGraph$_CreateDayGrid() {
   var grid = [];

   for(var week = 0; week < 6; week++) {
      grid[week] = [];

      for(var day = 0; day < 7; day++) {
         grid[week][day] = 0;
      }
   }

  return grid;
};

MonthGraph._Events = {
   CellHover: function MonthGraph$_Events$CellHover(event) {
      event.target.dataset.lastFill = event.target.style.fill;
      event.target.style.fill = 'lightblue';

      event.target.dataset.lastCursor = event.target.style.cursor;
      event.target.style.cursor = 'pointer';
   },

   CellUnHover: function MonthGraph$_Events$CellUnHover(event) {
      event.target.style.fill = event.target.dataset.lastFill;
      delete event.target.dataset.lastFill;

      event.target.style.cursor = event.target.dataset.lastCursor;
      delete event.target.dataset.lastCursor;
   }
};

MonthGraph.Months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];