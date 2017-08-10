'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ModalBlock = exports.AlertBlock = exports.TableAndFieldList = exports.TableAndFieldEdit = exports.TableAndField = exports.FormField = exports.FormTextarea = exports.FormFieldComponet = exports.RFileComponent = exports.RFile = exports.RInsert = exports.RDateComponent = exports.RDate = exports.RCheckboxComponent = exports.RCheckbox = exports.RTagComponent = exports.RTag = exports.RSelectComponent = exports.RSelect = exports.renderFieldSelect = exports.RTextarea = exports.RSuggestSelComponent2 = exports.RSuggestSel2 = exports.RSuggestSelComponent1 = exports.RSuggestSel = exports.RSuggestComponent = exports.RSuggest = exports.RInputComponent = exports.RInput = exports.RBreadcrumbSimple = exports.InventoryTable = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.fromISODateFormat = fromISODateFormat;
exports.toISODateFormat = toISODateFormat;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactBootstrapTable = require('react-bootstrap-table');

var _reactBootstrapDatePicker = require('react-bootstrap-date-picker');

var _reactBootstrapDatePicker2 = _interopRequireDefault(_reactBootstrapDatePicker);

var _ssuggestor = require('ssuggestor');

var _ssuggestor2 = _interopRequireDefault(_ssuggestor);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _reactBootstrap = require('react-bootstrap');

var _immutable3 = require('redux-form/immutable');

var _reactSelect = require('react-select');

var _reactSelect2 = _interopRequireDefault(_reactSelect);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
驗証規則
If the value is valid, the validation function should return undefined.
If the value is invalid, the validation function should return an error.
This is usually a string, but it does not have to be.
*/
var required = function required(value) {
  return value ? undefined : '必填欄位';
};
var maxLength = function maxLength(max) {
  return function (value) {
    return value && value.length > max ? '\u6700\u591A\u53EA\u80FD ' + max + ' \u500B\u5B57\u5143' : undefined;
  };
};
var minValue = function minValue(min) {
  return function (value) {
    return value && value < min ? '\u6700\u5C0F\u503C\u9700\u5927\u65BC ' + min : undefined;
  };
};
var number = function number(value) {
  return value && isNaN(Number(value)) ? '必須要數字' : undefined;
};
var email = function email(value) {
  return value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value) ? 'Invalid email address' : undefined;
};

var pointLength = function pointLength(length) {
  return function (value) {
    //let pattern = /^[0-9]+(.[0-9]{1,2})?$/i;
    var pattern = '^[0-9]+(.[0-9]{1,_length})?$';
    pattern = pattern.replace('_length', length);

    var patternRegExp = new RegExp(pattern);
    if (value && !patternRegExp.test(value)) {
      return '\u5C0F\u6578\u9EDE\u4E0B\u6700\u591A ' + length + ' \u4F4D';
    } else {
      return undefined;
    }
    //pattern
  };
};

var checkDuplicate = function checkDuplicate(props) {
  return function (value) {
    var err = '';

    if (props.hasOwnProperty('toUpperCase') && props.toUpperCase == true) {
      value = value.toUpperCase();
    }

    var filedName = props.name;
    props.DBStore.map(function (subObj) {

      if (subObj[filedName] == value) {
        //  console.log(value+' '+subObj[filedName]);
        err = '已存在相同值' + value;
      }
    });

    if (err) return err;
    return undefined;
  };
};

var createNew = function createNew(props) {
  return function (value, allValues, global_props) {
    var err = '';

    //當id沒有值,但temp有值,就顯示
    if (value == null || value == '') {
      var allValuesRow = allValues.toJS();
      if (allValuesRow[props.tempName] != '' && allValuesRow[props.tempName] != undefined) {
        err = '数据库中无此资料, 是否新增?';
      }
    }

    if (err) return err;
    return undefined;
  };
};

/*
contst pointLength = function(Length) {
  function(value) {
    ....
  }
}
*/

var importValidata = function importValidata(props) {
  var validateRow = [];
  props.number && validateRow.push(number);
  props.required && validateRow.push(required);
  props.maxLength && validateRow.push(maxLength(props.maxLength));
  props.minValue && validateRow.push(minValue(props.minValue));
  props.pointLength && validateRow.push(pointLength(props.pointLength));
  props.checkDuplicate && validateRow.push(checkDuplicate(props));
  props.createNew && validateRow.push(createNew(props));
  return validateRow;
};

var InventoryTable = exports.InventoryTable = function (_Component) {
  _inherits(InventoryTable, _Component);

  function InventoryTable(props) {
    _classCallCheck(this, InventoryTable);

    var _this = _possibleConstructorReturn(this, (InventoryTable.__proto__ || Object.getPrototypeOf(InventoryTable)).call(this, props));

    _this.summaryFormatter = _this.summaryFormatter.bind(_this);
    _this.handleModalDismiss = _this.handleModalDismiss.bind(_this);
    _this.handleModalShow = _this.handleModalShow.bind(_this);
    _this.onRowClick = _this.onRowClick.bind(_this);
    return _this;
  }

  _createClass(InventoryTable, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.setState({ showEditModalVisiable: false, myStoreSize: 0 });
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this.props.RBTP.config.saveAfterEdit = false;
      this.props.RBTP.config.editModalText = "查詢資料";
      this.props.RBTP.config.insertButtonVisible = false;
      this.props.RBTP.init(this);

      if (this.props.filter) {
        for (var key in this.props.filter) {
          this.refs[key].applyFilter(this.props.filter[key]);
          this.refs.BootstrapTabletableRef.handleSort('desc', key);
        }
      }

      var myStore = this.props.RBTP.BootStrapTableObj.store;
      var dataSize = 0;
      if ((typeof myStore === 'undefined' ? 'undefined' : _typeof(myStore)) === 'object' && myStore.filteredData != null) {
        dataSize = Object.keys(myStore.filteredData).length;
      } else {
        dataSize = Object.keys(myStore.data).length;
      }
      $('#size').html('總共有 <span>' + dataSize + '</span> 筆資料');
    }
  }, {
    key: 'enumFormatter',
    value: function enumFormatter(cell, row, formatExtraData) {
      return formatExtraData[cell];
    }
  }, {
    key: 'summaryFormatter',
    value: function summaryFormatter(cell, row, formatExtraData) {
      var vendorTitle = formatExtraData[row['vendorId']];
      //引擎,廠牌,機型代號,機型名稱,顏色,專分銷,進車日期
      var str = row['engBodyNo'] + '<br>' + vendorTitle + '<br>' + row['modelId'] + '<br>' + row['modelTitle'] + '<br>' + row['vColor'] + '<br>' + row['dealerShortTitle'] + '<br>' + row['vInDate'];
      //限定只有點選Summary才會致能
      return '<div onClick=(document.getElementById(\'isSummary\').value=\'1\') >' + str + '</div>';
    }
  }, {
    key: 'handleModalShow',
    value: function handleModalShow() {
      this.setState({ showEditModalVisiable: true });
    }
  }, {
    key: 'handleModalDismiss',
    value: function handleModalDismiss() {
      this.setState({ showEditModalVisiable: false });
    }
  }, {
    key: 'onRowClick',
    value: function onRowClick(rows) {
      if (document.getElementById('isSummary').value == '1') {
        this.props.RBTP.showEditModal(rows);
        //this.setState({showEditModalVisiable:true});
      }
      document.getElementById('isSummary').value = '0';
    }
  }, {
    key: 'render',
    value: function render() {
      //處理資料
      var infoRows = this.props.infoRows.toJS() || [];
      var inventoryRows = infoRows['vehicle_inventory'] || [];

      var vendorRows = this.props.RBTP.getRSelectRow(infoRows, 'vendor', 'vendorId', 'vendorTitle');
      //  let dealerRows=this.props.RBTP.getRSelectRow(infoRows,'dealer','dealerId','dealerTitle');

      //  let inventoryRows=infoRows['inventory'] || [];
      var BootstrapTableData = this.props.RBTP.getBootstrapTableData(inventoryRows);

      var defaultOptions = this.props.RBTP.defaultOptions();
      defaultOptions['onRowClick'] = this.onRowClick;
      defaultOptions['paginationShowsTotal'] = false;

      var modeObj = { 'mode': 'checkbox' };
      if (this.props.RBTP.config.selectRowMode == '') {
        modeObj = { 'mode': 'hide' };
      }

      return _react2.default.createElement(
        'div',
        { className: this.props.tableClassName },
        _react2.default.createElement('div', { id: 'size', name: 'size' }),
        _react2.default.createElement('input', { type: 'hidden', id: 'isSummary', value: '0' }),
        _react2.default.createElement(
          'div',
          { id: 'mobile' },
          _react2.default.createElement(
            _reactBootstrapTable.BootstrapTable,
            {
              ref: 'BootstrapTabletableRef',
              data: BootstrapTableData,
              options: defaultOptions,
              insertRow: true,

              selectRow: modeObj
            },
            _react2.default.createElement(
              _reactBootstrapTable.TableHeaderColumn,
              { ref: 'dealerId', dataField: 'dealerId', hidden: true, filter: { type: 'TextFilter' } },
              '\u5C08\u5206\u92B7\u4EE3\u865F'
            ),
            _react2.default.createElement(
              _reactBootstrapTable.TableHeaderColumn,
              { dataField: 'vNo', hidden: true },
              '\u8ECA\u724C (\u9818\u724C\u8ECA)'
            ),
            _react2.default.createElement(
              _reactBootstrapTable.TableHeaderColumn,
              { dataField: 'vendorId', dataFormat: this.enumFormatter, formatExtraData: vendorRows, hidden: true },
              '\u5EE0\u724C'
            ),
            _react2.default.createElement(
              _reactBootstrapTable.TableHeaderColumn,
              { dataField: 'summary', dataFormat: this.summaryFormatter, hiddenOnInsert: true, formatExtraData: vendorRows },
              '\u6458\u8981'
            ),
            _react2.default.createElement(
              _reactBootstrapTable.TableHeaderColumn,
              { ref: 'engBodyNo', dataField: 'engBodyNo', hidden: true, isKey: true, filter: { type: 'TextFilter' } },
              '\u5F15\u64CE\u865F\u78BC'
            ),
            _react2.default.createElement(
              _reactBootstrapTable.TableHeaderColumn,
              { ref: 'modelId', dataField: 'modelId', hidden: true, filter: { type: 'TextFilter' } },
              '\u6A5F\u578B\u4EE3\u865F'
            ),
            _react2.default.createElement(
              _reactBootstrapTable.TableHeaderColumn,
              { dataField: 'modelTitle', hidden: true },
              'Title'
            ),
            _react2.default.createElement(
              _reactBootstrapTable.TableHeaderColumn,
              { dataField: 'vColor', hidden: true },
              '\u984F\u8272'
            ),
            _react2.default.createElement(
              _reactBootstrapTable.TableHeaderColumn,
              { dataField: 'vInDate', hidden: true },
              '\u9032\u8ECA\u65E5\u671F'
            ),
            _react2.default.createElement(
              _reactBootstrapTable.TableHeaderColumn,
              { dataField: 'vOutDate', hidden: true },
              '\u51FA\u5EE0\u65E5\u671F'
            ),
            _react2.default.createElement(
              _reactBootstrapTable.TableHeaderColumn,
              { dataField: 'memo', editable: { type: 'textarea' }, hidden: true },
              '\u5099\u8A3B'
            )
          )
        ),
        _react2.default.createElement('br', null)
      );
    }
  }]);

  return InventoryTable;
}(_react.Component);

var RBreadcrumbSimple = exports.RBreadcrumbSimple = function RBreadcrumbSimple(props) {
  var RootURL = props.RootURL && props.RootURL || '/';

  return _react2.default.createElement(
    _reactBootstrap.Breadcrumb,
    null,
    _react2.default.createElement(
      _reactBootstrap.Breadcrumb.Item,
      { href: RootURL },
      ' \u9996\u9801 '
    ),
    _react2.default.createElement(
      _reactBootstrap.Breadcrumb.Item,
      { href: props.Path },
      ' ',
      props.Item,
      ' '
    )
  );
};

var RInput = exports.RInput = function (_Component2) {
  _inherits(RInput, _Component2);

  function RInput(props) {
    _classCallCheck(this, RInput);

    return _possibleConstructorReturn(this, (RInput.__proto__ || Object.getPrototypeOf(RInput)).call(this, props));
  }

  _createClass(RInput, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      var tempName = this.props.name + '_' + Math.random();
      this.setState({ 'tempName': tempName });
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      if (this.props.hasOwnProperty('readOnlyForEdit') && this.props.readOnlyForEdit == true || this.props.hasOwnProperty('readOnly') && this.props.readOnly == true) {
        //若有 fieldValue , 則優先考優
        //若已有 值, 則代入值 (SelectedRow)
        //若有 defaultValue , 則代入
        if (this.props.fieldValue) {} else if (!this.props.fieldValue) {
          if (document.getElementsByName(this.props.name)[0].value) {
            if (document.getElementsByName(this.props.name)[0].value != 'undefined') document.getElementById(this.state.tempName).value = document.getElementsByName(this.props.name)[0].value;
          } else {
            if (this.props.defaultValue && this.props.defaultValue != 'undefined') {
              document.getElementById(this.state.tempName).value = this.props.defaultValue;
            }
          }
        } else if (this.props.hasOwnProperty('defaultValue') && this.props.defaultValue) {}
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var props = this.props;
      var tempName = this.state.tempName;
      /*
      在 TableAndFieldEdit 中
      if(this.props.actionType=='create')  readOnlyForEdit=false;
      */
      var validateFunc = importValidata(props);

      if (props.hasOwnProperty('readOnlyForEdit') && props.readOnlyForEdit == true || props.hasOwnProperty('readOnly') && props.readOnly == true) {

        var width = Math.min(props.maxLength * 16 + 40, 750) + 'px';
        var inputStyle = { 'width': width };

        return _react2.default.createElement(
          'div',
          { style: inputStyle },
          _react2.default.createElement(
            _reactBootstrap.FormGroup,
            null,
            _react2.default.createElement(
              _reactBootstrap.ControlLabel,
              null,
              props.label
            ),
            _react2.default.createElement(_reactBootstrap.FormControl, { type: props.type, value: props.fieldValue, name: tempName, id: tempName, readOnly: true, style: inputStyle })
          ),
          _react2.default.createElement(
            'div',
            { className: 'hide' },
            _react2.default.createElement(_immutable3.Field, _extends({ className: 'form-control' }, props, { label: props.label, name: props.name, component: RInputComponent, validate: validateFunc }))
          )
        );
      } else {
        return _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(_immutable3.Field, _extends({}, props, { className: 'form-control', DBStore: props.DBStore, label: props.label, name: props.name, id: props.name, component: RInputComponent, validate: validateFunc }))
        );
      }
    }
  }]);

  return RInput;
}(_react.Component);

var RInputComponent = exports.RInputComponent = function (_Component3) {
  _inherits(RInputComponent, _Component3);

  function RInputComponent(props) {
    _classCallCheck(this, RInputComponent);

    var _this3 = _possibleConstructorReturn(this, (RInputComponent.__proto__ || Object.getPrototypeOf(RInputComponent)).call(this, props));

    _this3.focus = _this3.focus.bind(_this3);
    _this3.onKeyUp = _this3.onKeyUp.bind(_this3);
    return _this3;
  }

  _createClass(RInputComponent, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      // if(this.props.fieldValue!=nextProps.fieldValue)
      // {
      //   this.props.input.onChange(nextProps.fieldValue);
      // }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      var _props$meta = this.props.meta,
          touched = _props$meta.touched,
          error = _props$meta.error,
          warning = _props$meta.warning;

      if (touched && error) {
        if (typeof this.props.onErrorCallBack == 'function') {
          var errObj = {
            label: this.props.label,
            name: this.props.input.name,
            error: this.props.meta.error
          };
          this.props.onErrorCallBack(errObj);
        }
      }
    }
  }, {
    key: 'focus',
    value: function focus() {
      var _props$meta2 = this.props.meta,
          touched = _props$meta2.touched,
          error = _props$meta2.error,
          warning = _props$meta2.warning;

      if (touched && error) {
        // Explicitly focus the text input using the raw DOM API
        this.textInput.focus();
      }
    }
  }, {
    key: 'onKeyUp',
    value: function onKeyUp(e) {
      if (this.props.hasOwnProperty('toUpperCase') && this.props.toUpperCase == true) {
        e.target.value = e.target.value.toUpperCase();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      //Marks the given fields as "touched" to show errors. This is a bound action creator, so it returns nothing.
      var _props = this.props,
          name = _props.name,
          input = _props.input,
          label = _props.label,
          type = _props.type,
          maxLength = _props.maxLength,
          _props$meta3 = _props.meta,
          touched = _props$meta3.touched,
          error = _props$meta3.error,
          warning = _props$meta3.warning;

      var width = Math.min(maxLength * 16 + 40, 750) + 'px';
      return _react2.default.createElement(
        _reactBootstrap.FormGroup,
        { validationState: touched && (error && "error" || null) || null },
        _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            _reactBootstrap.ControlLabel,
            null,
            label
          ),
          ' ',
          touched && (error && _react2.default.createElement(
            _reactBootstrap.Label,
            { bsStyle: 'danger' },
            error
          ) || warning && _react2.default.createElement(
            'span',
            null,
            warning
          )),
          _react2.default.createElement('input', _extends({ onKeyUp: this.onKeyUp, className: 'form-control' }, input, { id: name, type: type, maxLength: maxLength, ref: function ref(input) {
              _this4.textInput = input;
            }, style: { width: width } })),
          _react2.default.createElement(_reactBootstrap.FormControl.Feedback, null)
        )
      );
    }
  }]);

  return RInputComponent;
}(_react.Component);

/*********************************
*  R-Suggest
*********************************/

var RSuggest = exports.RSuggest = function RSuggest(props) {
  var importValidataFuc = importValidata(props);
  //避免在 Field 里用 onChange 力
  return _react2.default.createElement(
    'div',
    null,
    _react2.default.createElement(_immutable3.Field, _extends({ className: 'form-control', id: props.name, name: props.name,
      component: RSuggestComponent, validate: importValidataFuc
    }, props))
  );
};

var RSuggestComponent = exports.RSuggestComponent = function (_Component4) {
  _inherits(RSuggestComponent, _Component4);

  function RSuggestComponent(props) {
    _classCallCheck(this, RSuggestComponent);

    var _this5 = _possibleConstructorReturn(this, (RSuggestComponent.__proto__ || Object.getPrototypeOf(RSuggestComponent)).call(this, props));

    _this5.onChange = _this5.onChange.bind(_this5);
    return _this5;
  }

  _createClass(RSuggestComponent, [{
    key: 'onChange',
    value: function onChange(value) {
      this.props.input.onChange(value);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props2 = this.props,
          name = _props2.name,
          input = _props2.input,
          label = _props2.label,
          type = _props2.type,
          maxLength = _props2.maxLength,
          _props2$meta = _props2.meta,
          touched = _props2$meta.touched,
          error = _props2$meta.error,
          warning = _props2$meta.warning;
      //console.log(input);

      return _react2.default.createElement(
        _reactBootstrap.FormGroup,
        { validationState: touched && (error && "error" || null) || null },
        _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            _reactBootstrap.ControlLabel,
            null,
            label,
            name
          ),
          ' ',
          touched && (error && _react2.default.createElement(
            _reactBootstrap.Label,
            { bsStyle: 'danger' },
            error
          ) || warning && _react2.default.createElement(
            'span',
            null,
            warning
          )),
          _react2.default.createElement(_ssuggestor2.default, _extends({
            className: 'input-group',
            list: this.props.list,
            placeholder: this.props.placeholder,
            arrow: true,
            close: true
          }, input, {
            onChange: this.onChange
          })),
          _react2.default.createElement('input', _extends({ type: 'hidden', name: name }, input)),
          _react2.default.createElement(_reactBootstrap.FormControl.Feedback, null)
        )
      );
    }
  }]);

  return RSuggestComponent;
}(_react.Component);
////////////////////////////////////////////////////////////////////////////////

/*********************************
*  R-SuggestSel-1 (Two Field)
*********************************/

var RSuggestSel = exports.RSuggestSel = function RSuggestSel(props) {
  var tempName = '_cReatEneW_1049_' + props.name;
  var newprops = Object.assign({
    'createNew': true,
    'tempName': tempName
  }, props); //複製


  var importValidataFuc = importValidata(newprops);
  //避免在 Field 里用 onChange 力
  return _react2.default.createElement(
    'div',
    null,
    _react2.default.createElement(_immutable3.Field, _extends({ className: 'form-control', id: props.name, name: props.name,
      component: RSuggestSelComponent1, validate: importValidataFuc
    }, newprops))
  );
};

var RSuggestSelComponent1 = exports.RSuggestSelComponent1 = function (_Component5) {
  _inherits(RSuggestSelComponent1, _Component5);

  function RSuggestSelComponent1(props) {
    _classCallCheck(this, RSuggestSelComponent1);

    var _this6 = _possibleConstructorReturn(this, (RSuggestSelComponent1.__proto__ || Object.getPrototypeOf(RSuggestSelComponent1)).call(this, props));

    _this6.onChange = _this6.onChange.bind(_this6);
    _this6.onCreateNew = _this6.onCreateNew.bind(_this6);
    return _this6;
  }

  _createClass(RSuggestSelComponent1, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.setState({ 'suggestValue': '', 'bt_create': 'hide' });
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var _props3 = this.props,
          reduxDispatch = _props3.reduxDispatch,
          reduxFormChange = _props3.reduxFormChange,
          tempName = _props3.tempName;


      if (nextProps.fieldValue != this.props.fieldValue) {
        document.getElementsByName(tempName)[0].value = '';
        var suggestValue = this.props.suggestData.object[nextProps.fieldValue];
        this.setState({ 'suggestValue': suggestValue });
        reduxDispatch(reduxFormChange(tempName, suggestValue));
      }
    }
  }, {
    key: 'onChange',
    value: function onChange(value) {

      var index = Object.values(this.props.suggestData.object).indexOf(value);
      //document.getElementsByName("test234")[0].onChange(value);
      //  document.getElementsByName(this.props.tempName)[0].value=value;
      // console.log(this.state.suggestValue);
      if (index == undefined || index == -1) {
        this.props.input.onChange("");
        if (value == '') {
          this.setState({ 'bt_create': 'hide' });
        } else {
          this.setState({ 'bt_create': '' });
        }
      } else {
        var indexValue = Object.keys(this.props.suggestData.object)[index];
        this.props.input.onChange(indexValue);
        this.setState({ 'bt_create': 'hide' });
      }
      this.setState({ suggestValue: value });

      var _props4 = this.props,
          reduxDispatch = _props4.reduxDispatch,
          reduxFormChange = _props4.reduxFormChange;

      reduxDispatch(reduxFormChange(this.props.tempName, value));
    }
  }, {
    key: 'onCreateNew',
    value: function onCreateNew() {
      var _this7 = this;

      var btCreateNew = document.getElementById('btCreateNew_' + this.props.name);
      btCreateNew.disabled = true;
      var v = document.getElementsByName(this.props.tempName)[0].value;
      //
      var newFiledObj = {};
      newFiledObj[this.props.extraInfo.keyField] = v;

      _axios2.default.post('/api/addInfo', {
        table: this.props.extraInfo.table,
        newFiledObj: newFiledObj
      }).then(function (response) {
        if (response.data.success === true) {
          _this7.props.input.onChange(response.data.result.insertId);
          _this7.props.onGetRow();
          _this7.setState({ 'bt_create': 'hide' });
        }
        btCreateNew.disabled = false;
      }) //.then
      .catch(function (error) {
        console.log(error);
        btCreateNew.disabled = false;
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _React$createElement;

      var _props5 = this.props,
          name = _props5.name,
          input = _props5.input,
          label = _props5.label,
          type = _props5.type,
          maxLength = _props5.maxLength,
          _props5$meta = _props5.meta,
          touched = _props5$meta.touched,
          error = _props5$meta.error,
          warning = _props5$meta.warning;

      var btCreateNew = 'btCreateNew_' + name;
      return _react2.default.createElement(
        _reactBootstrap.FormGroup,
        { validationState: touched && (error && "error" || null) || null },
        _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            _reactBootstrap.ControlLabel,
            null,
            this.props.label
          ),
          ' ',
          touched && (error && _react2.default.createElement(
            _reactBootstrap.Label,
            { bsStyle: 'danger' },
            error
          ) || warning && _react2.default.createElement(
            'span',
            null,
            warning
          )),
          _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(
              'div',
              { className: 'pull-left' },
              _react2.default.createElement(_ssuggestor2.default, {
                className: 'input-group',
                list: this.props.suggestData.array,
                placeholder: this.props.placeholder,
                arrow: true,
                close: true,
                value: this.state.suggestValue,
                onChange: this.onChange
              })
            ),
            '\xA0\xA0',
            _react2.default.createElement(
              _reactBootstrap.Button,
              (_React$createElement = { className: 'pull-left', bsStyle: 'warning', type: 'button', id: btCreateNew, name: btCreateNew }, _defineProperty(_React$createElement, 'className', this.state.bt_create), _defineProperty(_React$createElement, 'onClick', this.onCreateNew), _React$createElement),
              '\u65B0\u589E'
            )
          ),
          _react2.default.createElement('input', _extends({ type: 'hidden', id: name, name: name }, input)),
          _react2.default.createElement(_immutable3.Field, { type: 'hidden', id: this.props.tempName, component: 'input', name: this.props.tempName,
            value: this.state.suggestValue }),
          _react2.default.createElement('br', null),
          _react2.default.createElement(_reactBootstrap.FormControl.Feedback, null)
        ),
        _react2.default.createElement('div', { className: 'clearfix' })
      );
    }
  }]);

  return RSuggestSelComponent1;
}(_react.Component);
////////////////////////////////////////////////////////////////////////////////


/*********************************
*  R-SuggestSel-2 (for Fields)
*********************************/

var RSuggestSel2 = exports.RSuggestSel2 = function RSuggestSel2(props) {
  var tempName = '_cReatEneW_1049_' + props.name;
  var newprops = Object.assign({
    'createNew': true,
    'tempName': tempName
  }, props); //複製

  var names = [props.name, newprops.tempName];
  //newprops.createNew = true;
  var importValidataFuc = importValidata(newprops);
  //避免在 Field 里用 onChange 力
  return _react2.default.createElement(
    'div',
    null,
    _react2.default.createElement(_immutable3.Fields, _extends({ className: 'form-control', names: names,
      component: RSuggestSelComponent2, validate: importValidataFuc
    }, newprops))
  );
};

var RSuggestSelComponent2 = exports.RSuggestSelComponent2 = function (_Component6) {
  _inherits(RSuggestSelComponent2, _Component6);

  function RSuggestSelComponent2(props) {
    _classCallCheck(this, RSuggestSelComponent2);

    var _this8 = _possibleConstructorReturn(this, (RSuggestSelComponent2.__proto__ || Object.getPrototypeOf(RSuggestSelComponent2)).call(this, props));

    _this8.onChange = _this8.onChange.bind(_this8);
    return _this8;
  }

  _createClass(RSuggestSelComponent2, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.setState({ 'suggestValue': '' });
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.fieldValue != this.props.fieldValue) {
        document.getElementsByName(this.props.tempName)[0].value = '';
        var suggestValue = this.props.suggestData.object[nextProps.fieldValue];
        this.setState({ 'suggestValue': suggestValue });
        this.props[this.props.tempName].input.onChange(suggestValue);
      }
    }
  }, {
    key: 'onChange',
    value: function onChange(value) {
      var index = Object.values(this.props.suggestData.object).indexOf(value);
      //  document.getElementsByName(this.props.tempName)[0].value=value;
      if (index == undefined || index == -1) {
        this.props[this.props.name].input.onChange("");
      } else {
        var indexValue = Object.keys(this.props.suggestData.object)[index];
        this.props[this.props.name].input.onChange(indexValue);
      }
      this.setState({ suggestValue: value });
      this.props[this.props.tempName].input.onChange(value);
    }
  }, {
    key: 'render',
    value: function render() {
      console.log(this.props);
      var _props6 = this.props,
          type = _props6.type,
          maxLength = _props6.maxLength;
      var _props$props$name = this.props[this.props.name],
          name = _props$props$name.name,
          input = _props$props$name.input,
          _props$props$name$met = _props$props$name.meta,
          touched = _props$props$name$met.touched,
          error = _props$props$name$met.error,
          warning = _props$props$name$met.warning;


      return _react2.default.createElement(
        _reactBootstrap.FormGroup,
        { validationState: touched && (error && "error" || null) || null },
        _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            _reactBootstrap.ControlLabel,
            null,
            this.props.label
          ),
          ' ',
          touched && (error && _react2.default.createElement(
            _reactBootstrap.Label,
            { bsStyle: 'danger' },
            error
          ) || warning && _react2.default.createElement(
            'span',
            null,
            warning
          )),
          _react2.default.createElement(_ssuggestor2.default, {
            className: 'input-group',
            list: this.props.suggestData.array,
            placeholder: this.props.placeholder,
            arrow: true,
            close: true,
            value: this.state.suggestValue,
            onChange: this.onChange
          }),
          _react2.default.createElement('input', _extends({ type: 'text', id: this.props.tempName, name: this.props.tempName,
            value: this.state.suggestValue }, this.props[this.props.tempName].input)),
          _react2.default.createElement('input', _extends({ type: 'hidden1', id: name, name: name }, input)),
          _react2.default.createElement(_reactBootstrap.FormControl.Feedback, null)
        )
      );
    }
  }]);

  return RSuggestSelComponent2;
}(_react.Component);
////////////////////////////////////////////////////////////////////////////////

var RTextarea = exports.RTextarea = function RTextarea(props) {
  var readOnlyProperty = '';
  if (props.readOnly) readOnlyProperty = 'readOnly';

  return _react2.default.createElement(
    _reactBootstrap.FormGroup,
    { controlId: props.controlId },
    _react2.default.createElement(
      _reactBootstrap.ControlLabel,
      null,
      props.label
    ),
    _react2.default.createElement(_immutable3.Field, { className: 'form-control', name: props.name, component: 'textarea', readOnly: readOnlyProperty })
  );
};

var renderFieldSelect = exports.renderFieldSelect = function renderFieldSelect(props) {
  //console.log(props);
  var name = props.name,
      input = props.input,
      label = props.label,
      type = props.type,
      maxLength = props.maxLength,
      _props$meta4 = props.meta,
      touched = _props$meta4.touched,
      error = _props$meta4.error,
      warning = _props$meta4.warning;

  return _react2.default.createElement(
    _reactBootstrap.FormGroup,
    { validationState: touched && (error && "error" || null) || null },
    _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement(
        _reactBootstrap.ControlLabel,
        null,
        label,
        name
      ),
      ' ',
      touched && (error && _react2.default.createElement(
        _reactBootstrap.Label,
        { bsStyle: 'danger' },
        error
      ) || warning && _react2.default.createElement(
        'span',
        null,
        warning
      )),
      _react2.default.createElement(
        'select',
        { name: name, id: name, className: 'form-control', placeholder: label },
        props.children
      ),
      _react2.default.createElement(_reactBootstrap.FormControl.Feedback, null)
    )
  );
};

var RSelect = exports.RSelect = function RSelect(props) {
  var importValidataFuc = importValidata(props);
  //避免在 Field 里用 onChange 力
  return _react2.default.createElement(
    'div',
    null,
    _react2.default.createElement(
      _immutable3.Field,
      _extends({ className: 'form-control', id: props.name, name: props.name,
        component: RSelectComponent, validate: importValidataFuc,
        onChangeSel: props.onChange }, props),
      props.children
    )
  );
};

var RSelectComponent = exports.RSelectComponent = function (_Component7) {
  _inherits(RSelectComponent, _Component7);

  function RSelectComponent(props) {
    _classCallCheck(this, RSelectComponent);

    var _this9 = _possibleConstructorReturn(this, (RSelectComponent.__proto__ || Object.getPrototypeOf(RSelectComponent)).call(this, props));

    _this9.onChangeSel = _this9.onChangeSel.bind(_this9);
    return _this9;
  }

  _createClass(RSelectComponent, [{
    key: 'onChangeSel',
    value: function onChangeSel(e) {
      var input = this.props.input;

      var _selVal = e.target.value;
      input.onChange(_selVal);
      //console.log(this.props);
      if (typeof this.props.onChangeSel == 'function') {
        this.props.onChangeSel();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props7 = this.props,
          name = _props7.name,
          input = _props7.input,
          label = _props7.label,
          type = _props7.type,
          maxLength = _props7.maxLength,
          onChange = _props7.onChange,
          _props7$meta = _props7.meta,
          touched = _props7$meta.touched,
          error = _props7$meta.error,
          warning = _props7$meta.warning;

      return _react2.default.createElement(
        _reactBootstrap.FormGroup,
        { style: { width: 200 }, validationState: touched && (error && "error" || null) || null },
        _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            _reactBootstrap.ControlLabel,
            null,
            label,
            name
          ),
          ' ',
          touched && (error && _react2.default.createElement(
            _reactBootstrap.Label,
            { bsStyle: 'danger' },
            error
          ) || warning && _react2.default.createElement(
            'span',
            null,
            warning
          )),
          _react2.default.createElement(
            'select',
            _extends({ name: name, className: 'form-control', placeholder: label }, input, { id: name, onChange: this.onChangeSel }),
            _react2.default.createElement('option', null),
            this.props.children
          ),
          _react2.default.createElement(_reactBootstrap.FormControl.Feedback, null)
        )
      );
    }
  }]);

  return RSelectComponent;
}(_react.Component);
////////////////////////////////////////////////////////////////////////////////

var RTag = exports.RTag = function RTag(props) {
  var importValidataFuc = importValidata(props);
  //避免在 Field 里用 onChange 力
  return _react2.default.createElement(
    'div',
    null,
    _react2.default.createElement(
      _immutable3.Field,
      _extends({ className: 'form-control', id: props.name, name: props.name,
        component: RTagComponent, validate: importValidataFuc,
        onChangeSel: props.onChange }, props),
      props.children
    )
  );
};

var RTagComponent = exports.RTagComponent = function (_Component8) {
  _inherits(RTagComponent, _Component8);

  function RTagComponent(props) {
    _classCallCheck(this, RTagComponent);

    var _this10 = _possibleConstructorReturn(this, (RTagComponent.__proto__ || Object.getPrototypeOf(RTagComponent)).call(this, props));

    _this10.logChange = _this10.logChange.bind(_this10);
    _this10.promptTextCreator = _this10.promptTextCreator.bind(_this10);
    _this10.transToStr = _this10.transToStr.bind(_this10);
    _this10.transToArray = _this10.transToArray.bind(_this10);
    return _this10;
  }

  _createClass(RTagComponent, [{
    key: 'componentWillMount',
    value: function componentWillMount() {

      this.setState({ 'value': '' });
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (this.props.fieldValue != nextProps.fieldValue) {
        this.props.input.onChange(nextProps.fieldValue);
      }
      var obj = [];
      obj = this.transToArray(nextProps.input.value, nextProps.suggestData);
      this.setState({ 'value': obj });
    }
  }, {
    key: 'promptTextCreator',
    value: function promptTextCreator(label) {
      return '\u65B0\u589E' + label;
    }
  }, {
    key: 'logChange',
    value: function logChange(value) {
      var _this11 = this;

      this.setState({ value: value });
      var is_new = false;
      var row = value;

      if (row) {
        var _loop = function _loop(key) {
          if (row[key]['className']) {
            is_new = true;
            var p1 = new Promise(function (resolve, reject) {
              var newFiledObj = {};
              newFiledObj[_this11.props.extraInfo.keyField] = row[key]['value'];

              _axios2.default.post('/api/addInfo', {
                table: _this11.props.extraInfo.table,
                newFiledObj: newFiledObj
              }).then(function (response) {
                if (response.data.success === true) {
                  row[key]['value'] = response.data.result.insertId;
                  _this11.props.onGetRow();
                  resolve(row);
                }
              }) //.then
              .catch(function (error) {
                //console.log(error);
              });
            });

            p1.then(function (row) {

              var str = _this11.transToStr(row);
              _this11.props.input.onChange(str);
            }); //p1
          } //if
        };

        for (var key in row) {
          _loop(key);
        } //for

        if (!is_new) {
          var str = this.transToStr(row);
          this.props.input.onChange(str);
        }
      } //if
    }
  }, {
    key: 'transToStr',
    value: function transToStr(row) {
      var str = '';
      if (row) {
        for (var key in row) {
          if (str) str += '|';
          str += row[key]['value'];
        }
      }
      return str;
    }
  }, {
    key: 'transToArray',
    value: function transToArray(str, suggestData) {

      if (!str) return null;
      var rows = str.split('|');
      var obj = [];
      for (var key in rows) {
        var val = rows[key];
        obj.push({ 'value': val, 'label': suggestData.object[val] });
      }
      return obj;
    }
  }, {
    key: 'render',
    value: function render() {
      var _props8 = this.props,
          name = _props8.name,
          input = _props8.input,
          label = _props8.label,
          type = _props8.type,
          maxLength = _props8.maxLength,
          suggestData = _props8.suggestData,
          _props8$meta = _props8.meta,
          touched = _props8$meta.touched,
          error = _props8$meta.error,
          warning = _props8$meta.warning;


      var options = [];

      for (var key in suggestData.object) {

        options.push({ 'value': key, 'label': suggestData.object[key] });
      }

      return _react2.default.createElement(
        _reactBootstrap.FormGroup,
        { validationState: touched && (error && "error" || null) || null },
        _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            _reactBootstrap.ControlLabel,
            null,
            label,
            name
          ),
          ' ',
          touched && (error && _react2.default.createElement(
            _reactBootstrap.Label,
            { bsStyle: 'danger' },
            error
          ) || warning && _react2.default.createElement(
            'span',
            null,
            warning
          )),
          _react2.default.createElement(_reactSelect2.default.Creatable, {
            placeholder: label,
            value: this.state.value,
            options: options,
            onChange: this.logChange,
            promptTextCreator: this.promptTextCreator,
            multi: true
          }),
          _react2.default.createElement('input', _extends({ type: 'hidden' }, input)),
          _react2.default.createElement(_reactBootstrap.FormControl.Feedback, null)
        )
      );
    }
  }]);

  return RTagComponent;
}(_react.Component);

////////////////////////////////////////////////////////////////////////////////

var RCheckbox = exports.RCheckbox = function RCheckbox(props) {
  return _react2.default.createElement(
    'div',
    null,
    _react2.default.createElement(_immutable3.Field, _extends({ className: 'form-control', id: props.name, name: props.name, component: RCheckboxComponent }, props))
  );
};

var RCheckboxComponent = exports.RCheckboxComponent = function (_Component9) {
  _inherits(RCheckboxComponent, _Component9);

  function RCheckboxComponent(props) {
    _classCallCheck(this, RCheckboxComponent);

    var _this12 = _possibleConstructorReturn(this, (RCheckboxComponent.__proto__ || Object.getPrototypeOf(RCheckboxComponent)).call(this, props));

    _this12.onChange = _this12.onChange.bind(_this12);
    return _this12;
  }

  _createClass(RCheckboxComponent, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.setState({ Value: this.props.input.value });
      if (this.props.input.value == '1') {
        this.setState({ 'checked': true });
      } else {
        this.setState({ 'checked': false });
      }
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps() {}
  }, {
    key: 'onChange',
    value: function onChange(e) {
      var thisObj = e.target.id;
      var Value = document.getElementById(thisObj).checked && '1' || '0';
      this.props.input.onChange(Value);
    }
  }, {
    key: 'render',
    value: function render() {
      var tempName = this.props.id + '_' + Math.random();
      var checked = this.props.input.value == '1' && true || false;

      return _react2.default.createElement(
        _reactBootstrap.FormGroup,
        null,
        _react2.default.createElement(
          _reactBootstrap.Checkbox,
          { onChange: this.onChange, id: tempName, name: tempName, checked: checked },
          this.props.children
        ),
        this.props.label,
        _react2.default.createElement('input', _extends({ type: 'hidden' }, this.props.input))
      );
    }
  }]);

  return RCheckboxComponent;
}(_react.Component);

//http://pushtell.github.io/react-bootstrap-date-picker/
/*
<div>
  <Field {...props} className="form-control" label={props.label} name={props.name} id={props.name} component={RInputComponent} validate={validateFunc} />
</div>
*/


var RDate = exports.RDate = function RDate(props) {
  return _react2.default.createElement(
    'div',
    null,
    _react2.default.createElement(_immutable3.Field, _extends({ className: 'form-control', id: props.name, name: props.name }, props, { component: RDateComponent, validate: importValidata(props) }))
  );
};

var RDateComponent = exports.RDateComponent = function (_Component10) {
  _inherits(RDateComponent, _Component10);

  function RDateComponent(props) {
    _classCallCheck(this, RDateComponent);

    var _this13 = _possibleConstructorReturn(this, (RDateComponent.__proto__ || Object.getPrototypeOf(RDateComponent)).call(this, props));

    _this13.onChange = _this13.onChange.bind(_this13);
    return _this13;
  }

  _createClass(RDateComponent, [{
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {}
  }, {
    key: 'onChange',
    value: function onChange(v, f) {
      this.props.input.onChange(f);
    }
  }, {
    key: 'render',
    value: function render() {
      /*
      //Marks the given fields as "touched" to show errors. This is a bound action creator, so it returns nothing.
      let { name, input, label, type, maxLength, meta: { touched, error, warning } }=this.props;
      let width = Math.min(maxLength*16+40, 750) + 'px';
        return (
        <FormGroup validationState={(touched && ((error && "error") || (null) )) || (null)}>
          <div >
            <ControlLabel>{label}</ControlLabel>{' '}{touched && ((error && <Label bsStyle="danger">{error}</Label>) || (warning && <span>{warning}</span>))}
            <input className="form-control" {...input} id={name}  type={type} maxLength={maxLength} ref={(input) => { this.textInput = input;}} style={{width:width}}/>
            <FormControl.Feedback />
          </div>
        </FormGroup>
       */
      // console.log((this.props.input.value));
      // console.log(toISODateFormat(this.props.input.value));
      // console.log(' props => '+this.props.input.value);
      var _props9 = this.props,
          name = _props9.name,
          input = _props9.input,
          label = _props9.label,
          type = _props9.type,
          maxLength = _props9.maxLength,
          _props9$meta = _props9.meta,
          touched = _props9$meta.touched,
          error = _props9$meta.error,
          warning = _props9$meta.warning;


      return _react2.default.createElement(
        _reactBootstrap.FormGroup,
        { style: { width: 200 }, validationState: touched && (error && "error" || null) || null },
        _react2.default.createElement(
          _reactBootstrap.ControlLabel,
          null,
          label
        ),
        ' ',
        touched && (error && _react2.default.createElement(
          _reactBootstrap.Label,
          { bsStyle: 'danger' },
          error
        ) || warning && _react2.default.createElement(
          'span',
          null,
          warning
        )),
        _react2.default.createElement('input', _extends({ type: 'hidden' }, this.props.input)),
        _react2.default.createElement(_reactBootstrapDatePicker2.default, { dateFormat: 'YYYY/MM/DD', dayLabels: ['日', '一', '二', '三', '四', '五', '六'], onChange: this.onChange, value: toISODateFormat(this.props.input.value) })
      );
    }
  }]);

  return RDateComponent;
}(_react.Component);

function fromISODateFormat() {
  var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;


  var TimeNow = void 0;
  if (value) {
    TimeNow = new Date(value);
  } else {
    TimeNow = new Date();
  }

  var yyyy = TimeNow.getUTCFullYear();
  var MM = (TimeNow.getMonth() + 1 < 10 ? '0' : '') + (TimeNow.getMonth() + 1);
  var dd = (TimeNow.getDate() < 10 ? '0' : '') + TimeNow.getDate();
  var newvalue = yyyy + '-' + MM + '-' + dd;
  return newvalue;
}

function toISODateFormat(value) {
  var newvalue = '';
  if (value && typeof value != 'undefined') {
    if (value.indexOf('T') > 0) {
      newvalue = value;
    } else {

      var TimeNow = new Date(value);
      var yyyy = TimeNow.getUTCFullYear();
      var MM = (TimeNow.getMonth() + 1 < 10 ? '0' : '') + (TimeNow.getMonth() + 1);
      var dd = (TimeNow.getDate() < 10 ? '0' : '') + TimeNow.getDate();
      newvalue = yyyy + '-' + MM + '-' + dd + 'T04:00:00.000Z';

      //  newvalue= new Date(value).toISOString();
    }
  } else {
    newvalue = '';
  }
  return newvalue;
}

var RInsert = exports.RInsert = function RInsert(props) {
  return _react2.default.createElement(
    'div',
    null,
    _react2.default.createElement(_immutable3.Field, _extends({ className: 'form-control', id: props.name, name: props.name, component: RInsertComponent }, props))
  );
};

var RInsertComponent = function RInsertComponent(props) {
  var tempName = props.id + '_' + Math.random();
  var input = props.input;


  function insertTextarea(e) {
    var input = props.input;

    document.getElementById(props.id).value += document.getElementById(tempName).value + '\r\n';
    input.onChange(document.getElementById(props.id).value);
  }

  return _react2.default.createElement(
    _reactBootstrap.FormGroup,
    null,
    _react2.default.createElement(
      'label',
      { className: 'control-label' },
      props.label
    ),
    _react2.default.createElement(
      _reactBootstrap.Row,
      null,
      _react2.default.createElement(
        _reactBootstrap.Col,
        { sm: 10 },
        _react2.default.createElement(
          'select',
          { placeholder: 'select', name: tempName, id: tempName, className: 'form-control' },
          props.children
        )
      ),
      _react2.default.createElement(
        _reactBootstrap.Col,
        { sm: 1 },
        _react2.default.createElement(
          _reactBootstrap.Button,
          { onClick: insertTextarea },
          '\u63D2\u5165'
        )
      )
    ),
    _react2.default.createElement('div', { style: { padding: 3 } }),
    _react2.default.createElement('textarea', _extends({ id: input.name, placeholder: props.label, value: input.value || "" }, input, { className: 'form-control' }))
  );
};

//////////////////////////

var RFile = exports.RFile = function (_Component11) {
  _inherits(RFile, _Component11);

  function RFile(props) {
    _classCallCheck(this, RFile);

    return _possibleConstructorReturn(this, (RFile.__proto__ || Object.getPrototypeOf(RFile)).call(this, props));
  }

  _createClass(RFile, [{
    key: 'render',
    value: function render() {
      var importValidataFuc = importValidata(this.props);
      return _react2.default.createElement(_immutable3.Field, _extends({}, this.props, { className: 'form-control', label: this.props.label, name: this.props.name, component: RFileComponent, validate: importValidataFuc, showModal: this.showModal }));
    }
  }]);

  return RFile;
}(_react.Component);

var RFileComponent = exports.RFileComponent = function (_Component12) {
  _inherits(RFileComponent, _Component12);

  function RFileComponent(props) {
    _classCallCheck(this, RFileComponent);

    var _this15 = _possibleConstructorReturn(this, (RFileComponent.__proto__ || Object.getPrototypeOf(RFileComponent)).call(this, props));

    _this15.hideModal = _this15.hideModal.bind(_this15);
    _this15.showModal = _this15.showModal.bind(_this15);
    _this15.uploadFile = _this15.uploadFile.bind(_this15);
    _this15.showAtt = _this15.showAtt.bind(_this15);

    var uploadFileName = '_upload_files_' + Math.floor(Math.random() * 1000000);
    _this15.config = { uploadFileName: uploadFileName };
    return _this15;
  }

  _createClass(RFileComponent, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.hideModal();
    }
  }, {
    key: 'showAtt',
    value: function showAtt() {
      if (this.props.input.value != "") {
        var url = '/files/' + this.props.input.value;
        var win = window.open(url, '_blank');
        win.focus();
      }
    }
  }, {
    key: 'showModal',
    value: function showModal() {
      this.setState({ isShowModal: true, uploadFileName: this.config.uploadFileName });
    }
  }, {
    key: 'hideModal',
    value: function hideModal() {
      this.setState({ isShowModal: false });
    }
  }, {
    key: 'uploadFile',
    value: function uploadFile(e) {
      var parentThis = this;

      var data = new FormData();

      data.append('upload', document.getElementById(this.config.uploadFileName).files[0]);

      var config = {
        headers: { 'encType': 'multipart/form-data' }
      };

      /*** 測試數據 ***
      let targetFile='1098_m_1488706859762.jpg'
      //document.getElementById(parentThis.props.input.name).value=targetFile;
      parentThis.props.input.onChange(targetFile);
      parentThis.hideModal();
      return ;
      /*** 測試數據 ***/

      _axios2.default.post('/uploadFile', data, config).then(function (res) {
        var targetFile = res.data.targetFile;
        //document.getElementById(parentThis.props.input.name).value=targetFile;
        parentThis.props.input.onChange(targetFile);
        parentThis.hideModal();
      }).catch(function (err) {
        console.log(err.message);
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _props10 = this.props,
          name = _props10.name,
          input = _props10.input,
          label = _props10.label,
          type = _props10.type,
          maxLength = _props10.maxLength,
          showModal = _props10.showModal,
          _props10$meta = _props10.meta,
          touched = _props10$meta.touched,
          error = _props10$meta.error,
          warning = _props10$meta.warning;

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          _reactBootstrap.FormGroup,
          { controlId: name, validationState: touched && (error && "error" || null) || null },
          _react2.default.createElement(
            'div',
            { style: { width: 400 } },
            _react2.default.createElement(
              _reactBootstrap.ControlLabel,
              null,
              label
            ),
            ' ',
            touched && (error && _react2.default.createElement(
              _reactBootstrap.Label,
              { bsStyle: 'danger' },
              error
            ) || warning && _react2.default.createElement(
              'span',
              null,
              warning
            )),
            _react2.default.createElement(
              'span',
              { className: 'input-group' },
              _react2.default.createElement(
                'span',
                { className: 'input-group-btn' },
                _react2.default.createElement(
                  'button',
                  { type: 'button', className: 'btn btn-default', onClick: this.showModal },
                  '\u4E0A\u50B3'
                )
              ),
              _react2.default.createElement('input', _extends({ className: 'form-control', id: input.name }, input, { placeholder: label, type: type, maxLength: maxLength })),
              _react2.default.createElement(
                'span',
                { className: 'input-group-btn' },
                this.props.input.value && _react2.default.createElement(
                  'button',
                  { type: 'button', className: 'btn btn-default', onClick: this.showAtt },
                  _react2.default.createElement('span', { className: 'glyphicon glyphicon-eye-open' })
                ),
                _react2.default.createElement(
                  'button',
                  { type: 'button', className: 'btn btn-default', onClick: this.showModal },
                  _react2.default.createElement('span', { className: 'glyphicon glyphicon-folder-open' })
                )
              )
            )
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Modal,
          { show: this.state.isShowModal, onHide: this.hideModal },
          _react2.default.createElement(
            _reactBootstrap.Modal.Header,
            { closeButton: true },
            _react2.default.createElement(
              _reactBootstrap.Modal.Title,
              null,
              '\u8ACB\u9078\u64C7\u4E0A\u50B3\u7684\u6A94\u6848'
            )
          ),
          _react2.default.createElement(
            _reactBootstrap.Modal.Body,
            null,
            _react2.default.createElement('input', { type: 'file', name: this.state.uploadFileName, id: this.state.uploadFileName, className: 'form-control' })
          ),
          _react2.default.createElement(
            _reactBootstrap.Modal.Footer,
            null,
            _react2.default.createElement(
              _reactBootstrap.Button,
              { onClick: this.hideModal },
              '\u53D6\u6D88'
            ),
            _react2.default.createElement(
              _reactBootstrap.Button,
              { onClick: this.uploadFile, bsStyle: 'primary' },
              '\u78BA\u8A8D\u4E0A\u50B3'
            )
          )
        )
      );
    }
  }]);

  return RFileComponent;
}(_react.Component);

var FormFieldComponet = exports.FormFieldComponet = function FormFieldComponet(props) {
  return _react2.default.createElement(
    _reactBootstrap.FormGroup,
    { controlId: props.name },
    _react2.default.createElement(
      _reactBootstrap.ControlLabel,
      null,
      props.label
    ),
    _react2.default.createElement(_reactBootstrap.FormControl, { type: props.type, placeholder: props.placeholder })
  );
};

var FormTextarea = exports.FormTextarea = function FormTextarea(props) {
  return _react2.default.createElement(
    _reactBootstrap.FormGroup,
    { controlId: '{props.controlId}' },
    _react2.default.createElement(
      _reactBootstrap.ControlLabel,
      null,
      props.Label
    ),
    _react2.default.createElement(_reactBootstrap.FormControl, { componentClass: 'textarea', placeholder: props.placeholder }),
    _react2.default.createElement(_reactBootstrap.HelpBlock, null)
  );
};

var FormField = exports.FormField = function FormField(props) {
  return _react2.default.createElement(
    'div',
    null,
    _react2.default.createElement(
      _reactBootstrap.FormGroup,
      { controlId: '{props.controlId}' },
      _react2.default.createElement(
        _reactBootstrap.ControlLabel,
        null,
        props.Label
      ),
      _react2.default.createElement(_reactBootstrap.FormControl, null),
      _react2.default.createElement(_reactBootstrap.HelpBlock, null)
    )
  );
};

/*
  cell: 原先cell的值
  row: 此列的所有值
  formatExtraData : 庫

*/
function enumFormatter(cell, row, formatExtraData) {
  return formatExtraData[cell];
}

function normalFormatter(cell, row, formatExtraData) {
  return cell;
}

function dateFormatter(cell, row, formatExtraData) {
  var TimeNow = new Date(cell);
  var yyyy = TimeNow.toLocaleDateString().slice(0, 4);
  var MM = (TimeNow.getMonth() + 1 < 10 ? '0' : '') + (TimeNow.getMonth() + 1);
  var dd = (TimeNow.getDate() < 10 ? '0' : '') + TimeNow.getDate();
  var Value = yyyy + '-' + MM + '-' + dd;
  return Value;

  //let cellRow=cell.split('T');
  //return cellRow[0];
}

var TableAndField = exports.TableAndField = function (_Component13) {
  _inherits(TableAndField, _Component13);

  function TableAndField(props) {
    _classCallCheck(this, TableAndField);

    return _possibleConstructorReturn(this, (TableAndField.__proto__ || Object.getPrototypeOf(TableAndField)).call(this, props));
  }

  _createClass(TableAndField, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(ModalBlock, this.props),
        _react2.default.createElement(AlertBlock, this.props),
        _react2.default.createElement(TableAndFieldList, _extends({ ref: 'TableAndFieldListRef' }, this.props)),
        _react2.default.createElement(TableAndFieldEdit, _extends({}, this.props, { TableAndFieldListRef: this.refs.TableAndFieldListRef }))
      );
    }
  }]);

  return TableAndField;
}(_react.Component);

var TableAndFieldEdit = exports.TableAndFieldEdit = function (_Component14) {
  _inherits(TableAndFieldEdit, _Component14);

  function TableAndFieldEdit(props) {
    _classCallCheck(this, TableAndFieldEdit);

    var _this17 = _possibleConstructorReturn(this, (TableAndFieldEdit.__proto__ || Object.getPrototypeOf(TableAndFieldEdit)).call(this, props));

    _this17.mySubmitMethod = _this17.mySubmitMethod.bind(_this17);
    return _this17;
  }

  _createClass(TableAndFieldEdit, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps) {
      switch (nextProps.actionMode) {
        case "List":
          if (this.props.Field != 'List') {
            return true;
          } else {
            return false;
          }
          break;

        default:
        case "Field":
          return true;
          break;
      }
    }
  }, {
    key: 'mySubmitMethod',
    value: function mySubmitMethod(values) {
      var _this18 = this;

      var FieldData = this.props.FieldData;

      var rows = values.toJS();
      var errObj = {},
          createObj = {};

      FieldData.map(function (obj) {
        var filedName = obj.name;

        //若是新創時
        if (obj.isKey && _this18.props.actionType == 'create') {
          var DBStore = _this18.props.TableAndFieldListRef.refs.BootstrapTabletableRef.store.data;
          DBStore.map(function (subObj) {
            if (subObj[filedName] == rows[filedName]) {
              errObj[filedName] = '已存在相同值' + rows[filedName];
              errObj['_error'] = 'failed!';
              throw new _immutable3.SubmissionError(errObj);
            }
          });
        }

        //若是有特別的資料結構
        if (obj.hasOwnProperty('dateType')) {
          switch (obj.dateType) {
            case 'carNo':

              var _carNo = rows[filedName];

              if (_carNo && _carNo.length > 0) {
                _carNo = _carNo.replace('-', '');
                switch (_carNo.length) {
                  case 4:
                  case 5:
                    _carNo = _carNo.substr(0, 2) + '-' + _carNo.substr(2);
                    break;

                  case 6:
                  case 7:
                    _carNo = _carNo.substr(0, 3) + '-' + _carNo.substr(3);
                    break;

                  default:
                    errObj[filedName] = '車牌長度不正確';
                    errObj['_error'] = 'failed!';
                    throw new _immutable3.SubmissionError(errObj);
                    break;
                }
                if (_carNo != rows[filedName]) {
                  errObj[filedName] = '車牌格式不正確,你是否要填寫' + _carNo + '?';
                  errObj['_error'] = 'failed!';
                  throw new _immutable3.SubmissionError(errObj);
                }
              }
              break;

            default:
              break;
          }
        }
      });

      var valueJS = (0, _immutable.fromJS)(rows);

      var p1 = new Promise(function (resolve, reject) {
        var resultObj = {};
        resolve(resultObj);
      });

      p1.then(function (resultObj) {
        if (_this18.props.actionType == 'create') {
          //Notice: 不要寫成 values.toJS()
          _this18.props.onAddRow(valueJS);
        } else {
          _this18.props.onSetRow(rows);
        }

        _this18.props.onFieldCancel();
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this19 = this;

      var _props11 = this.props,
          handleSubmit = _props11.handleSubmit,
          FieldData = _props11.FieldData,
          SelectedRow = _props11.SelectedRow;

      var columnClassName = void 0;
      switch (this.props.actionMode) {
        case "Field":
          columnClassName = '';
          break;

        default:
        case "List":
          columnClassName = 'hidden';
          break;
      }

      return _react2.default.createElement(
        'div',
        { className: columnClassName },
        _react2.default.createElement(
          'form',
          { onSubmit: handleSubmit(this.mySubmitMethod), name: 'MyForm', id: 'MyForm' },
          _react2.default.createElement(
            _reactBootstrap.Panel,
            null,
            _react2.default.createElement(
              _reactBootstrap.ButtonToolbar,
              { className: 'text-right' },
              _react2.default.createElement(
                _reactBootstrap.Button,
                { bsStyle: 'success', bsSize: 'lg', type: 'submit' },
                '\u5132\u5B58'
              ),
              _react2.default.createElement(
                _reactBootstrap.Button,
                { bsStyle: 'default', bsSize: 'lg', onClick: this.props.onFieldCancel },
                '\u53D6\u6D88'
              )
            ),

            /* ======================================
            // 從選擇的SelectedRow找到對應的value
            // 用於非 Field 的 data , 如readonly中正規的值
            // 真正的值会由 onRowSelect（由BootstrapTable中的option selectRow ) 这事件触发后
            // 透过 this.props.onSetSelectedInfo(row) 写到 Field 里
            // ======================================*/

            FieldData.map(function (obj) {
              var value = '';
              value = SelectedRow && SelectedRow[obj.name];

              var readOnlyForEdit = obj.readOnlyForEdit;
              var checkDuplicate = void 0; //此参数只根据是否为主键isKey来决定

              if (_this19.props.actionType == 'create' && obj.hasOwnProperty('readOnlyForEdit')) {
                readOnlyForEdit = undefined;
              }

              if (obj.hasOwnProperty('isKey')) {
                if (_this19.props.actionType == 'update') {
                  checkDuplicate = false;
                  readOnlyForEdit = true;
                } else if (_this19.props.actionType == 'create') {
                  checkDuplicate = true;
                  readOnlyForEdit = false;
                }
              }

              var formatExtraDataObj = [];

              if (obj.required) {
                obj.label = '*' + obj.label;
              }

              if (obj.hasOwnProperty('dateType') && obj.dateType == 'carNo') {
                obj.toUpperCase = true;
              }

              if (obj.hasOwnProperty('tablehide')) {
                //編輯畫面不顯示
                obj.type = 'hide';
              }

              switch (obj.type) {
                case "RInput":
                  var DBStore = {};
                  if (_this19.props.hasOwnProperty('TableAndFieldListRef') && typeof _this19.props.TableAndFieldListRef != 'undefined') {
                    DBStore = _this19.props.TableAndFieldListRef.refs.BootstrapTabletableRef.store.data;
                  }

                  return _react2.default.createElement(RInput, { key: obj.name,
                    name: obj.name,
                    isKey: obj.isKey,
                    label: obj.label,
                    number: obj.number,
                    required: obj.required,
                    unique: obj.unique,
                    maxLength: obj.maxLength,
                    pointLength: obj.pointLength,
                    readOnlyForEdit: readOnlyForEdit,
                    checkDuplicate: checkDuplicate,
                    toUpperCase: obj.toUpperCase,
                    fieldValue: value,
                    readOnly: obj.readOnly,
                    DBStore: DBStore });
                  break;

                case "RTag":
                  return _react2.default.createElement(RTag, { key: obj.name,
                    name: obj.name,
                    isKey: obj.isKey,
                    label: obj.label,
                    number: obj.number,
                    required: obj.required,
                    unique: obj.unique,
                    maxLength: obj.maxLength,
                    pointLength: obj.pointLength,
                    readOnlyForEdit: readOnlyForEdit,
                    checkDuplicate: checkDuplicate,
                    toUpperCase: obj.toUpperCase,
                    fieldValue: value,
                    suggestData: obj.suggestData,
                    extraInfo: obj.extraInfo,
                    onGetRow: _this19.props.onGetRow,
                    list: obj.list });
                  break;

                case "RSuggest":
                  return _react2.default.createElement(RSuggest, { key: obj.name,
                    name: obj.name,
                    isKey: obj.isKey,
                    label: obj.label,
                    number: obj.number,
                    required: obj.required,
                    unique: obj.unique,
                    maxLength: obj.maxLength,
                    pointLength: obj.pointLength,
                    readOnlyForEdit: readOnlyForEdit,
                    checkDuplicate: checkDuplicate,
                    toUpperCase: obj.toUpperCase,
                    fieldValue: value,
                    list: obj.list });
                  break;

                case "RSuggestSel":
                  return _react2.default.createElement(RSuggestSel, { key: obj.name,
                    name: obj.name,
                    isKey: obj.isKey,
                    label: obj.label,
                    number: obj.number,
                    required: obj.required,
                    unique: obj.unique,
                    maxLength: obj.maxLength,
                    pointLength: obj.pointLength,
                    readOnlyForEdit: readOnlyForEdit,
                    checkDuplicate: checkDuplicate,
                    toUpperCase: obj.toUpperCase,
                    fieldValue: value,
                    suggestData: obj.suggestData,
                    extraInfo: obj.extraInfo,
                    reduxFormChange: _this19.props.change,
                    reduxDispatch: _this19.props.dispatch,
                    onGetRow: _this19.props.onGetRow
                  });
                  break;

                case "RFile":
                  return _react2.default.createElement(RFile, {
                    key: obj.name,
                    name: obj.name,
                    label: obj.label,
                    number: obj.number,
                    required: obj.required,
                    unique: obj.unique,
                    readOnlyForEdit: readOnlyForEdit,
                    fieldValue: value });
                  break;

                case "RTextarea":
                  return _react2.default.createElement(RTextarea, {
                    key: obj.name,
                    name: obj.name,
                    label: obj.label,
                    number: obj.number,
                    required: obj.required,
                    unique: obj.unique,
                    maxLength: obj.maxLength,
                    readOnlyForEdit: readOnlyForEdit,
                    readOnly: obj.readOnly,
                    fieldValue: value | '' });
                  break;

                case "RDate":
                  return _react2.default.createElement(RDate, {
                    key: obj.name,
                    name: obj.name,
                    label: obj.label,
                    number: obj.number,
                    required: obj.required,
                    unique: obj.unique,
                    maxLength: obj.maxLength,
                    readOnlyForEdit: readOnlyForEdit,
                    fieldValue: value
                  });
                  break;

                case "RCheckbox":
                  return _react2.default.createElement(
                    RCheckbox,
                    {
                      key: obj.name,
                      name: obj.name,
                      number: obj.number,
                      required: obj.required,
                      unique: obj.unique,
                      maxLength: obj.maxLength,
                      readOnlyForEdit: readOnlyForEdit,
                      fieldValue: value | '' },
                    ' ',
                    obj.label,
                    ' '
                  );
                  break;

                case "RSelect":

                  if (typeof obj.formatExtraData != 'undefined') {
                    if (Object.prototype.toString.call(obj.formatExtraData) === '[object Array]') {
                      for (var key in obj.formatExtraData) {
                        formatExtraDataObj[key] = { value: key, title: obj.formatExtraData[key] };
                      }
                    } else if (Object.prototype.toString.call(obj.formatExtraData) === '[object Object]') {
                      var index = 0;
                      for (var _key in obj.formatExtraData) {
                        formatExtraDataObj[index++] = { value: _key, title: obj.formatExtraData[_key] };
                      }
                    }
                  }

                  return _react2.default.createElement(
                    RSelect,
                    {
                      key: obj.name,
                      name: obj.name,
                      label: obj.label,
                      number: obj.number,
                      required: obj.required,
                      unique: obj.unique,
                      maxLength: obj.maxLength,
                      readOnlyForEdit: readOnlyForEdit,
                      onChange: obj.onChange,
                      fieldValue: value | ''
                    },
                    formatExtraDataObj.map(function (obj) {
                      return _react2.default.createElement(
                        'option',
                        { value: obj.value, key: obj.value },
                        obj.title
                      );
                    })
                  );
                  break;

                case "RInsert":
                  if (typeof obj.formatExtraData != 'undefined') {
                    for (var _key2 in obj.formatExtraData) {
                      formatExtraDataObj[_key2] = { value: _key2, title: obj.formatExtraData[_key2] };
                    }
                  }
                  return _react2.default.createElement(
                    RSelect,
                    {
                      key: obj.name,
                      name: obj.name,
                      label: obj.label,
                      number: obj.number,
                      required: obj.required,
                      unique: obj.unique,
                      maxLength: obj.maxLength,
                      readOnlyForEdit: readOnlyForEdit,
                      fieldValue: value | ''
                    },
                    formatExtraDataObj.map(function (obj) {
                      return _react2.default.createElement(
                        'option',
                        { value: obj.value, key: obj.value },
                        obj.title
                      );
                    })
                  );
                  break;
              }
            }),
            _react2.default.createElement(
              _reactBootstrap.ButtonToolbar,
              { className: 'text-right' },
              _react2.default.createElement(
                _reactBootstrap.Button,
                { bsStyle: 'success', bsSize: 'lg', type: 'submit' },
                '\u5132\u5B58'
              ),
              _react2.default.createElement(
                _reactBootstrap.Button,
                { bsStyle: 'default', bsSize: 'lg', onClick: this.props.onFieldCancel },
                '\u53D6\u6D88'
              )
            )
          )
        )
      );
    }
  }]);

  return TableAndFieldEdit;
}(_react.Component);

var TableAndFieldList = exports.TableAndFieldList = function (_Component15) {
  _inherits(TableAndFieldList, _Component15);

  function TableAndFieldList(props) {
    _classCallCheck(this, TableAndFieldList);

    var _this20 = _possibleConstructorReturn(this, (TableAndFieldList.__proto__ || Object.getPrototypeOf(TableAndFieldList)).call(this, props));

    _this20.onCreateBTClick = _this20.onCreateBTClick.bind(_this20);
    _this20.onEditBTClick = _this20.onEditBTClick.bind(_this20);
    _this20.onRowSelect = _this20.onRowSelect.bind(_this20);
    _this20.onRowDoubleClick = _this20.onRowDoubleClick.bind(_this20);
    _this20.applyFilter = _this20.applyFilter.bind(_this20);
    _this20.onAdvaSearchBTClick = _this20.onAdvaSearchBTClick.bind(_this20);
    _this20.applyClearFilter = _this20.applyClearFilter.bind(_this20);
    _this20.expandComponent = _this20.expandComponent.bind(_this20);
    return _this20;
  }

  _createClass(TableAndFieldList, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.setState({ 'AdvantageSearchClass': 'hide' });
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var BootstrapOptions = this.props.BootstrapOptions;
      //預設的篩選條件

      if (typeof this.props.DefaultFilterValue != 'undefined') {
        for (var index in this.props.DefaultFilterValue) {
          var value = this.props.DefaultFilterValue[index].toString();
          this.refs[index].applyFilter(value);
        }
      }

      /*============================
      //  處理搜尋按鈕
      //============================*/
      //hide react-boostrap-table's serach field
      var is_filter_enable = false;
      $('.text-filter').each(function () {
        $(this).addClass('hide');
        is_filter_enable = true;
      });

      /*
      直接在css做修改了 */
      var formgroupbtn = $('div.react-bs-table-tool-bar > div.row > div:nth-child(2)');
      //     $('.react-bs-table-search-form').removeClass('form-group-sm').removeClass('input-group-sm').addClass('form-group-xlg').addClass('input-group-xlg');

      var groupbtn = formgroupbtn.find('span.input-group-btn');
      groupbtn.find('button').html('清除');

      //如果有進階搜尋功能才會開啟按鈕
      if (is_filter_enable) {
        groupbtn.append('<button id="BTAdvaSearch" class="btn btn-default" type="button">進階搜尋</button>');
        $('#BTAdvaSearch').click(this.onAdvaSearchBTClick);
      }

      /*============================
      //  處理功能按鈕類
      //============================*/

      //新增
      var addButton = $('#BootstrapTabletableRefAll').find('.react-bs-table-add-btn');
      if ($(addButton).attr('data-toggle') != "") {
        $(addButton).attr('data-toggle', '').click(this.onCreateBTClick);
      }

      if (BootstrapOptions.editMode != 'clickRow') {
        //編輯 , 會隨著有無被選取（onRowSelect）決定是否致能
        var html = '<button type="button" class="btn btn-edit-after-sel react-bs-table-edit-btn disabled" id="bt_edit">\n                  <i class="glyphicon glyphicon-pencil"></i>\u7DE8\u8F2F</button>';

        $('.btn-group').append(html).removeClass('btn-group-sm').addClass('btn-group-xlg');
        $('.react-bs-table-edit-btn').click(this.onEditBTClick);
      }
    }
  }, {
    key: 'onAdvaSearchBTClick',
    value: function onAdvaSearchBTClick() {
      if (this.state.AdvantageSearchClass == 'hide') {
        this.setState({ 'AdvantageSearchClass': '' });
      } else {
        this.setState({ 'AdvantageSearchClass': 'hide' });
      }
    }
  }, {
    key: 'onCreateBTClick',
    value: function onCreateBTClick() {
      //清完數據
      var rows = {};

      this.props.FieldData.map(function (obj) {
        if (obj.defaultFieldValue && obj.defaultFieldValue != '') {
          rows[obj.name] = obj.defaultFieldValue;
        } else {
          rows[obj.name] = '';
        }
      });

      this.props.onSetSelectedInfo(rows);
      //進到編輯畫面

      this.props.onAfterEditBTClick('create');
    }

    //在點擊編輯按鈕後

  }, {
    key: 'onEditBTClick',
    value: function onEditBTClick() {
      this.props.onAfterEditBTClick('update');
    }
  }, {
    key: 'onRowDoubleClick',
    value: function onRowDoubleClick(row) {
      if (this.props.BootstrapOptions.editMode == 'clickRow') {
        this.onEditBTClick();
      }
    }
  }, {
    key: 'onRowSelect',
    value: function onRowSelect(row, isSelected, e) {
      /* 目前在點擊列時, 會觸發
        onRowClick(react-boostrap-table-plugins.js) 以及
        onRowSelect（由BootstrapTable中的option selectRow 定義, BootstrapReduxForm.js）
      */

      //將值先寫入欄位
      this.props.onSetSelectedInfo(row);
      if (this.props.BootstrapOptions.editMode != 'clickRow') {
        //處理編輯的按鈕是否可以按
        if (isSelected) {
          $('.btn-edit-after-sel').removeClass('disabled');
        } else {
          $('.btn-edit-after-sel').addClass('disabled');
        }
      }
    }
  }, {
    key: 'applyClearFilter',
    value: function applyClearFilter() {
      var ParentThis = this;
      $('.input-filter').each(function () {
        var refsName = this.id.replace('_filter_', '');
        $(this).val('');
        ParentThis.refs[refsName].cleanFiltered();
      });
    }
  }, {
    key: 'applyFilter',
    value: function applyFilter() {
      var ParentThis = this;
      $('.input-filter').each(function () {
        if (this.value) {
          var refsName = this.id.replace('_filter_', '');
          ParentThis.refs[refsName].applyFilter(this.value);
        }
      });
    }
  }, {
    key: 'isExpandableRow',
    value: function isExpandableRow(row) {
      return false;
    }
  }, {
    key: 'expandComponent',
    value: function expandComponent(row) {
      return _react2.default.createElement(
        'div',
        null,
        'testok'
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var _props12 = this.props,
          BootstrapTableData = _props12.BootstrapTableData,
          FieldData = _props12.FieldData,
          actionMode = _props12.actionMode,
          BootstrapOptions = _props12.BootstrapOptions,
          SelectedRow = _props12.SelectedRow;


      FieldData.map(function (obj) {
        if (obj.name == 'sort') {
          BootstrapOptions['sortName'] = 'sort';
          BootstrapOptions['sortOrder'] = 'desc';
        }
      });

      BootstrapOptions['expanding'] = [1, 2];
      //双击, 在BootstrapReduxForm中定义
      BootstrapOptions['onRowDoubleClick'] = this.onRowDoubleClick;

      var selectRowObj = { mode: 'radio', clickToSelect: true, onSelect: this.onRowSelect };

      var BootstrapTableClass = void 0;
      switch (this.props.actionMode) {
        case "Field":
          BootstrapTableClass = 'hidden';

          break;

        default:
        case "List":
          BootstrapTableClass = '';
          break;
      }

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'div',
          { className: this.state.AdvantageSearchClass, id: 'serchField', name: 'serchField' },
          _react2.default.createElement(
            _reactBootstrap.Panel,
            { header: '\u9032\u968E\u641C\u5C0B' },
            _react2.default.createElement(
              _reactBootstrap.Form,
              { horizontal: true },
              FieldData.map(function (obj) {
                if (typeof obj.filter != 'undefined') {
                  var fieldName = '_filter_' + obj.name;

                  switch (obj.type) {
                    case "RSelect":
                      var formatExtraDataObj = [];
                      if (typeof obj.formatExtraData != 'undefined') {
                        for (var key in obj.formatExtraData) {
                          formatExtraDataObj[key] = { value: key, title: obj.formatExtraData[key] };
                        }
                      }

                      return _react2.default.createElement(
                        _reactBootstrap.FormGroup,
                        { controlId: fieldName, key: fieldName },
                        _react2.default.createElement(
                          _reactBootstrap.Col,
                          { sm: 2, componentClass: _reactBootstrap.ControlLabel },
                          obj.label
                        ),
                        _react2.default.createElement(
                          _reactBootstrap.Col,
                          { sm: 8 },
                          _react2.default.createElement(
                            _reactBootstrap.FormControl,
                            { componentClass: 'select', placeholder: 'select', bsClass: 'form-control input-filter' },
                            _react2.default.createElement('option', { value: '' }),
                            Object.keys(obj.formatExtraData).map(function (keyId) {
                              return _react2.default.createElement(
                                'option',
                                { key: keyId, value: keyId },
                                obj.formatExtraData[keyId]
                              );
                            })
                          )
                        )
                      );
                      break;

                    default:
                      return _react2.default.createElement(
                        _reactBootstrap.FormGroup,
                        { controlId: fieldName, key: fieldName },
                        _react2.default.createElement(
                          _reactBootstrap.Col,
                          { sm: 2, componentClass: _reactBootstrap.ControlLabel },
                          obj.label
                        ),
                        _react2.default.createElement(
                          _reactBootstrap.Col,
                          { sm: 8 },
                          _react2.default.createElement(_reactBootstrap.FormControl, { type: 'text', bsClass: 'form-control input-filter' })
                        )
                      );
                      break;
                  }
                }
              }),
              _react2.default.createElement(
                _reactBootstrap.ButtonToolbar,
                { className: 'text-right' },
                _react2.default.createElement(
                  _reactBootstrap.Col,
                  { xs: 4, xsOffset: 6 },
                  _react2.default.createElement(
                    _reactBootstrap.Button,
                    { bsSize: 'lg', type: 'button', onClick: this.onAdvaSearchBTClick },
                    '\u96B1\u85CF'
                  ),
                  _react2.default.createElement(
                    _reactBootstrap.Button,
                    { bsSize: 'lg', type: 'button', onClick: this.applyClearFilter },
                    '\u6E05\u9664'
                  ),
                  _react2.default.createElement(
                    _reactBootstrap.Button,
                    { bsStyle: 'success', bsSize: 'lg', type: 'button', onClick: this.applyFilter },
                    '\u7BE9\u9078'
                  )
                )
              )
            )
          )
        ),
        _react2.default.createElement(
          'div',
          { className: BootstrapTableClass, ref: 'BootstrapTabletableRefAll', id: 'BootstrapTabletableRefAll' },
          _react2.default.createElement(
            _reactBootstrapTable.BootstrapTable,
            {
              ref: 'BootstrapTabletableRef',
              data: BootstrapTableData,
              options: BootstrapOptions,
              expandableRow: this.isExpandableRow,
              expandComponent: this.expandComponent,
              insertRow: true, deleteRow: true, search: true, pagination: true, hover: true,
              searchPlaceholder: '\u8ACB\u8F38\u5165\u67E5\u8A62\u7684\u95DC\u9375\u5B57...',
              selectRow: selectRowObj,
              condensed: true

            },
            FieldData.map(function (obj) {
              var hidden = false;
              if (typeof obj.listhide != 'undefined') hidden = true;

              var dataFormat = normalFormatter;

              if (typeof obj.dataFormat != 'undefined') dataFormat = obj.dataFormat;

              var formatExtraData = {};
              var filter = {}; ///篩選條件

              switch (obj.type) {
                case "RCheckbox":
                case "RSuggestSel":
                case "RSuggest":
                case "RInput":
                case "RTag":
                case "RFile":
                case "RSelect":
                case "RInsert":
                  if (typeof obj.formatExtraData != 'undefined') {
                    formatExtraData = obj.formatExtraData;
                    //normalFormatter / enumFormatter / dateFormatter
                    if (typeof obj.dataFormat == 'undefined') {
                      dataFormat = enumFormatter;
                    } else if (obj.dataFormat == 'normalFormatter') {
                      dataFormat = normalFormatter;
                    }
                  }

                  if (typeof obj.filter != 'undefined') {
                    filter = obj.filter;
                  }

                  return _react2.default.createElement(
                    _reactBootstrapTable.TableHeaderColumn,
                    { key: obj.name,
                      dataField: obj.name, isKey: obj.isKey, hidden: hidden,
                      dataFormat: dataFormat,
                      formatExtraData: formatExtraData,
                      dataSort: true,
                      ref: obj.name,
                      filter: filter,
                      width: obj.width,
                      className: obj.columnClassName,
                      columnClassName: obj.columnClassName
                    },
                    obj.label
                  );
                  break;

                case "RDate":
                  return _react2.default.createElement(
                    _reactBootstrapTable.TableHeaderColumn,
                    { key: obj.name,
                      dataField: obj.name, isKey: obj.isKey, hidden: hidden,
                      dataFormat: dateFormatter,
                      formatExtraData: formatExtraData,
                      dataSort: true,
                      width: obj.width,
                      className: obj.columnClassName,
                      columnClassName: obj.columnClassName
                    },
                    obj.label
                  );
                  break;

                case "RTextarea":
                  return _react2.default.createElement(
                    _reactBootstrapTable.TableHeaderColumn,
                    { key: obj.name,
                      dataField: obj.name, isKey: obj.isKey, hidden: hidden, dataSort: true,
                      width: obj.width,
                      className: obj.columnClassName,
                      columnClassName: obj.columnClassName
                    },
                    obj.label
                  );
                  break;
              }
            })
          )
        )
      );
    }
  }]);

  return TableAndFieldList;
}(_react.Component);

var AlertBlock = exports.AlertBlock = function (_Component16) {
  _inherits(AlertBlock, _Component16);

  function AlertBlock(props) {
    _classCallCheck(this, AlertBlock);

    var _this21 = _possibleConstructorReturn(this, (AlertBlock.__proto__ || Object.getPrototypeOf(AlertBlock)).call(this, props));

    _this21.handleAlertDismiss = _this21.handleAlertDismiss.bind(_this21);
    return _this21;
  }

  _createClass(AlertBlock, [{
    key: 'handleAlertDismiss',
    value: function handleAlertDismiss() {
      var payload = { 'key': 'alert', 'value': { 'alertVisible': false } };
      this.props.onSetUI(payload);
    }
  }, {
    key: 'render',
    value: function render() {
      var alert = { 'alertVisible': false };
      if (typeof this.props.uiRows != 'undefined') {
        var uiRows = this.props.uiRows.toJS() || {};
        if (uiRows['alert']) {
          alert = uiRows['alert'];
        }
      }

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement('div', { style: { padding: 5 } }),
        alert.alertVisible && _react2.default.createElement(
          _reactBootstrap.Alert,
          { bsStyle: alert.bsStyle, onDismiss: this.handleAlertDismiss },
          _react2.default.createElement(
            'h4',
            null,
            alert.title
          ),
          _react2.default.createElement(
            'p',
            null,
            alert.message
          )
        )
      );
    }
  }]);

  return AlertBlock;
}(_react.Component);

var ModalBlock = exports.ModalBlock = function (_Component17) {
  _inherits(ModalBlock, _Component17);

  function ModalBlock(props) {
    _classCallCheck(this, ModalBlock);

    var _this22 = _possibleConstructorReturn(this, (ModalBlock.__proto__ || Object.getPrototypeOf(ModalBlock)).call(this, props));

    _this22.handleModalDismiss = _this22.handleModalDismiss.bind(_this22);
    return _this22;
  }

  _createClass(ModalBlock, [{
    key: 'handleModalDismiss',
    value: function handleModalDismiss() {
      var payload = { 'key': 'modal', 'value': { 'modalVisible': false, 'handleModalClickClass': 'hide' } };
      this.props.onSetUI(payload);
    }
  }, {
    key: 'render',
    value: function render() {
      var modal = { 'modalVisible': false };
      if (typeof this.props.uiRows != 'undefined') {
        var uiRows = this.props.uiRows.toJS() || {};
        if (uiRows['modal']) {
          modal = uiRows['modal'];
        }
      }

      return _react2.default.createElement(
        _reactBootstrap.Modal,
        {
          show: modal.modalVisible,
          onHide: this.handleModalDismiss,
          'aria-labelledby': 'contained-modal-title'
        },
        _react2.default.createElement(
          _reactBootstrap.Modal.Header,
          { closeButton: true },
          _react2.default.createElement(
            _reactBootstrap.Modal.Title,
            { id: 'contained-modal-title' },
            modal.title
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Modal.Body,
          null,
          modal.body
        ),
        _react2.default.createElement(
          _reactBootstrap.Modal.Footer,
          null,
          _react2.default.createElement(
            _reactBootstrap.Button,
            { onClick: modal.handleModalClick, className: this.handleModalClickClass, bsSize: 'large', bsStyle: 'success' },
            '\u78BA\u8A8D'
          ),
          _react2.default.createElement(
            _reactBootstrap.Button,
            { onClick: this.handleModalDismiss, bsSize: 'large', bsStyle: 'danger' },
            '\u53D6\u6D88'
          )
        )
      );
    }
  }]);

  return ModalBlock;
}(_react.Component);