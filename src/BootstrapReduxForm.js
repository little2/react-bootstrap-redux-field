import React, {Component} from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import DatePicker from 'react-bootstrap-date-picker';
import SSuggestor from 'ssuggestor';

import Immutable, { fromJS } from 'immutable';

import {
  Form, Tabs, Tab, FormGroup, ControlLabel, Alert,
  FormControl, HelpBlock,  Panel, Checkbox,
  Breadcrumb, ButtonToolbar, Button, Label , Modal, Grid, Row, Col, ButtonGroup
} from 'react-bootstrap';

import { Field ,Fields, SubmissionError, formValueSelector,change  } from 'redux-form/immutable';

import Select from 'react-select';

import axios from 'axios';

/*
驗証規則
If the value is valid, the validation function should return undefined.
If the value is invalid, the validation function should return an error.
This is usually a string, but it does not have to be.
*/
const required = value => value ? undefined : '必填欄位'
const maxLength = max => value =>
  value && value.length > max ? `最多只能 ${max} 個字元` : undefined
const minValue = min => value =>
  value && value < min ? `最小值需大於 ${min}` : undefined
const number = value => value && isNaN(Number(value)) ? '必須要數字' : undefined
const email = value =>
  value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value) ?
  'Invalid email address' : undefined

const pointLength = length => value => {
  //let pattern = /^[0-9]+(.[0-9]{1,2})?$/i;
  let pattern = '^[0-9]+(.[0-9]{1,_length})?$';
  pattern=pattern.replace('_length', length);

  let patternRegExp = new RegExp(pattern);
  if(value && !patternRegExp.test(value))
  {
    return `小數點下最多 ${length} 位`;
  }
  else {
    return undefined;
  }
  //pattern
}

const checkDuplicate = props =>value => {
  let err='';

  if(props.hasOwnProperty('toUpperCase') && props.toUpperCase==true) {
    value = value.toUpperCase();
  }

  let filedName=props.name;
  props.DBStore.map(subObj=>{

    if(subObj[filedName]==value)
    {
    //  console.log(value+' '+subObj[filedName]);
      err='已存在相同值'+value;
    }
  });

  if(err) return err;
  return undefined;

}



const createNew = props =>(value,allValues,global_props) => {
  let err='';



  //當id沒有值,但temp有值,就顯示
  if(value==null || value=='')
  {
     let allValuesRow = allValues.toJS();
     if(allValuesRow[props.tempName]!='' && allValuesRow[props.tempName]!=undefined)
     {
       err='数据库中无此资料, 是否新增?';
     }
  }



  if(err) return err;
  return undefined;

}

/*
contst pointLength = function(Length) {
  function(value) {
    ....
  }
}
*/


const importValidata = (props) => {
  let validateRow=[];
  props.number && validateRow.push(number);
  props.required && validateRow.push(required);
  props.maxLength && validateRow.push(maxLength(props.maxLength));
  props.minValue && validateRow.push(minValue(props.minValue));
  props.pointLength && validateRow.push(pointLength(props.pointLength));
  props.checkDuplicate && validateRow.push(checkDuplicate(props));
  props.createNew && validateRow.push(createNew(props));
  return validateRow;
}

export class InventoryTable extends Component {
  constructor(props) {
    super(props);
    this.summaryFormatter = this.summaryFormatter.bind(this);
    this.handleModalDismiss = this.handleModalDismiss.bind(this);
    this.handleModalShow = this.handleModalShow.bind(this);
    this.onRowClick = this.onRowClick.bind(this);
  }

  componentWillMount() {
    this.setState({showEditModalVisiable:false,myStoreSize:0});
  }

  componentDidUpdate() {
    this.props.RBTP.config.saveAfterEdit=false;
    this.props.RBTP.config.editModalText="查詢資料";
    this.props.RBTP.config.insertButtonVisible=false;
    this.props.RBTP.init(this);

    if(this.props.filter)
    {
      for(let key in this.props.filter)
      {
        this.refs[key].applyFilter(this.props.filter[key]);
        this.refs.BootstrapTabletableRef.handleSort('desc', key);
      }
    }

    let myStore=this.props.RBTP.BootStrapTableObj.store;
    let dataSize=0;
    if(typeof(myStore)==='object' && myStore.filteredData!=null )
    {
      dataSize = Object.keys(myStore.filteredData).length;
    }
    else {
      dataSize = Object.keys(myStore.data).length;
    }
    $('#size').html('總共有 <span>'+dataSize+'</span> 筆資料');
  }


  enumFormatter(cell, row, formatExtraData) {
    return formatExtraData[cell];
  }

  summaryFormatter(cell, row, formatExtraData){
    let vendorTitle = formatExtraData[row['vendorId']];
    //引擎,廠牌,機型代號,機型名稱,顏色,專分銷,進車日期
    let str=`${row['engBodyNo']}<br>${vendorTitle}<br>${row['modelId']}<br>${row['modelTitle']}<br>${row['vColor']}<br>${row['dealerShortTitle']}<br>${row['vInDate']}`;
    //限定只有點選Summary才會致能
    return `<div onClick=(document.getElementById('isSummary').value='1') >`+str+`</div>`;
  }

  handleModalShow()
  {
    this.setState({showEditModalVisiable:true});
  }

  handleModalDismiss()
  {
    this.setState({showEditModalVisiable:false});
  }

  onRowClick(rows)
  {
    if(document.getElementById('isSummary').value=='1')
    {
      this.props.RBTP.showEditModal(rows);
      //this.setState({showEditModalVisiable:true});
    }
    document.getElementById('isSummary').value='0';
  }

  render()
  {
    //處理資料
    let infoRows=this.props.infoRows.toJS() || [];
    let inventoryRows=infoRows['vehicle_inventory'] || [];

    let vendorRows=this.props.RBTP.getRSelectRow(infoRows,'vendor','vendorId','vendorTitle');
  //  let dealerRows=this.props.RBTP.getRSelectRow(infoRows,'dealer','dealerId','dealerTitle');

  //  let inventoryRows=infoRows['inventory'] || [];
    let BootstrapTableData=this.props.RBTP.getBootstrapTableData(inventoryRows);

    let defaultOptions = this.props.RBTP.defaultOptions();
    defaultOptions['onRowClick']=this.onRowClick;
    defaultOptions['paginationShowsTotal']=false;

    let modeObj={'mode':'checkbox'};
    if(this.props.RBTP.config.selectRowMode=='')
    {
      modeObj={'mode':'hide'};
    }

    return (
      <div className={this.props.tableClassName}>
        <div id='size' name='size'></div>
        <input type='hidden' id='isSummary' value='0' />
        <div id='mobile' >
        <BootstrapTable
          ref='BootstrapTabletableRef'
          data={ BootstrapTableData }
          options={ defaultOptions }
          insertRow

          selectRow={modeObj}
          >
              <TableHeaderColumn ref='dealerId' dataField='dealerId'  hidden filter={ { type: 'TextFilter' } } >專分銷代號</TableHeaderColumn>
              <TableHeaderColumn dataField='vNo' hidden >車牌 (領牌車)</TableHeaderColumn>
              <TableHeaderColumn dataField='vendorId' dataFormat={ this.enumFormatter } formatExtraData={vendorRows} hidden>廠牌</TableHeaderColumn>
              <TableHeaderColumn dataField='summary' dataFormat={ this.summaryFormatter }  hiddenOnInsert formatExtraData={vendorRows}>摘要</TableHeaderColumn>
              <TableHeaderColumn ref='engBodyNo' dataField='engBodyNo' hidden isKey filter={ { type: 'TextFilter' } }>引擎號碼</TableHeaderColumn>
              <TableHeaderColumn ref='modelId' dataField='modelId' hidden  filter={ { type: 'TextFilter' } }>機型代號</TableHeaderColumn>
              <TableHeaderColumn dataField='modelTitle' hidden>Title</TableHeaderColumn>
              <TableHeaderColumn dataField='vColor' hidden>顏色</TableHeaderColumn>
              <TableHeaderColumn dataField='vInDate' hidden>進車日期</TableHeaderColumn>
              <TableHeaderColumn dataField='vOutDate' hidden>出廠日期</TableHeaderColumn>
              <TableHeaderColumn dataField='memo'  editable={ { type: 'textarea'} } hidden>備註</TableHeaderColumn>
        </BootstrapTable>
        </div>
        <br/>
      </div>
    );
  }
}


export const RBreadcrumbSimple = (props) => {
  let RootURL = (props.RootURL) && props.RootURL || '/';

  return (
    <Breadcrumb>
      <Breadcrumb.Item href={RootURL}> 首頁 </Breadcrumb.Item>
      <Breadcrumb.Item href={props.Path}> {props.Item} </Breadcrumb.Item>
    </Breadcrumb>
  );
}



export class RInput extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const tempName=this.props.name+'_'+Math.random();
    this.setState({'tempName':tempName});
  }

  componentDidUpdate() {
    if((this.props.hasOwnProperty('readOnlyForEdit') && this.props.readOnlyForEdit==true) || (this.props.hasOwnProperty('readOnly') && this.props.readOnly==true))
    {
      //若有 fieldValue , 則優先考優
      //若已有 值, 則代入值 (SelectedRow)
      //若有 defaultValue , 則代入
      if(this.props.fieldValue)
      {

      }
      else if(!this.props.fieldValue)
      {
        if(document.getElementsByName(this.props.name)[0].value)
        {
          if(document.getElementsByName(this.props.name)[0].value!='undefined')
          document.getElementById(this.state.tempName).value=document.getElementsByName(this.props.name)[0].value;
        }
        else {
          if(this.props.defaultValue && this.props.defaultValue!='undefined')
          {
            document.getElementById(this.state.tempName).value = this.props.defaultValue;
          }
        }
      }
      else if(this.props.hasOwnProperty('defaultValue') && this.props.defaultValue)
      {

      }
    }

  }

  render() {
    let props = this.props;
    let tempName = this.state.tempName;
    /*
    在 TableAndFieldEdit 中
    if(this.props.actionType=='create')  readOnlyForEdit=false;
    */
    let validateFunc = importValidata(props);

    if((props.hasOwnProperty('readOnlyForEdit') && props.readOnlyForEdit==true) || (props.hasOwnProperty('readOnly') && props.readOnly==true) )
    {

      let width = Math.min(props.maxLength*16+40, 750) + 'px';
      let inputStyle = {'width':width};


      return (
        <div style={inputStyle}>
          <FormGroup >
            <ControlLabel>{props.label}</ControlLabel>
            <FormControl type={props.type} value={props.fieldValue} name={tempName} id={tempName} readOnly style={inputStyle}></FormControl>
          </FormGroup>
          <div className="hide">
            <Field className="form-control" {...props} label={props.label} name={props.name} component={RInputComponent} validate={validateFunc} />
          </div>
        </div>
      )

    }
    else {
      return (
        <div>
          <Field {...props} className="form-control" DBStore={props.DBStore} label={props.label} name={props.name} id={props.name} component={RInputComponent} validate={validateFunc} />
        </div>
      )
   }
  }


}

export class RInputComponent extends Component {
  constructor(props) {
    super(props);
    this.focus = this.focus.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
   }




  componentWillReceiveProps(nextProps) {
    // if(this.props.fieldValue!=nextProps.fieldValue)
    // {
    //   this.props.input.onChange(nextProps.fieldValue);
    // }
  }


  componentDidUpdate() {
    let {  meta: { touched, error, warning } }=this.props;
    if(touched && error)
    {
     if(typeof(this.props.onErrorCallBack)=='function')
     {
       let errObj={
         label: this.props.label,
         name: this.props.input.name,
         error: this.props.meta.error
       };
       this.props.onErrorCallBack(errObj);
     }
    }
  }

  focus() {
    let {  meta: { touched, error, warning } }=this.props;
    if(touched && error)
    {
       // Explicitly focus the text input using the raw DOM API
       this.textInput.focus();
    }
  }

  onKeyUp(e) {
    if(this.props.hasOwnProperty('toUpperCase') && this.props.toUpperCase==true) {
      e.target.value = e.target.value.toUpperCase();
    }
  }


  render() {
    //Marks the given fields as "touched" to show errors. This is a bound action creator, so it returns nothing.
    let { name, input, label, type, maxLength, meta: { touched, error, warning } }=this.props;
    let width = Math.min(maxLength*16+40, 750) + 'px';
    return (
      <FormGroup validationState={(touched && ((error && "error") || (null) )) || (null)}>
        <div >
          <ControlLabel>{label}</ControlLabel>{' '}{touched && ((error && <Label bsStyle="danger">{error}</Label>) || (warning && <span>{warning}</span>))}
          <input onKeyUp={this.onKeyUp} className="form-control" {...input} id={name}  type={type} maxLength={maxLength} ref={(input) => { this.textInput = input;}} style={{width:width}}/>
          <FormControl.Feedback />
        </div>
      </FormGroup>
    );
  }
}



/*********************************
*  R-Suggest
*********************************/

export const RSuggest = (props) => {
  let importValidataFuc= importValidata(props) ;
  //避免在 Field 里用 onChange 力
  return (
    <div>
      <Field className = "form-control"  id={ props.name }  name={ props.name }
        component={ RSuggestComponent } validate={importValidataFuc}
        {...props}  >
      </Field>
    </div>
)};

export class RSuggestComponent extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(value) {
      this.props.input.onChange(value);
  }

  render() {
    const { name, input, label, type, maxLength, meta: { touched, error, warning } } = this.props;
    //console.log(input);
    return (
      <FormGroup validationState={(touched && ((error && "error") || (null) )) || (null)}>
        <div>
          <ControlLabel>{label}{name}</ControlLabel>{' '}{ touched && ((error && <Label bsStyle="danger">{error}</Label>) || (warning && <span>{warning}</span>))}
          <SSuggestor
           className="input-group"
           list={this.props.list}
           placeholder={this.props.placeholder}
           arrow={true}
           close={true}
           {...input}
           onChange={this.onChange}
         />
         {/*因為refux-form本身就有 input.onChange事件,要避免被蓋過*/}
         <input type='hidden' name={name} {...input} />
         <FormControl.Feedback />
        </div>
      </FormGroup>
    )
  }
}
////////////////////////////////////////////////////////////////////////////////

/*********************************
*  R-SuggestSel-1 (Two Field)
*********************************/

export const RSuggestSel = (props) => {
  let tempName='_cReatEneW_1049_'+props.name;
  let newprops=Object.assign(
    {
      'createNew':true,
      'tempName':tempName
    }, props);   //複製


  let importValidataFuc= importValidata(newprops) ;
  //避免在 Field 里用 onChange 力
  return (
    <div>
      <Field className = "form-control"   id={ props.name }  name={ props.name }
        component={ RSuggestSelComponent1 } validate={importValidataFuc}
        {...newprops}  >
      </Field>

    </div>
)};

export class RSuggestSelComponent1 extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onCreateNew = this.onCreateNew.bind(this);
  }

  componentWillMount() {
    this.setState({'suggestValue':'','bt_create':'hide'});
  }

  componentWillReceiveProps(nextProps) {
    const {reduxDispatch,reduxFormChange, tempName} = this.props;

    if(nextProps.fieldValue!=this.props.fieldValue)
    {
      document.getElementsByName(tempName)[0].value='';
      let suggestValue = this.props.suggestData.object[nextProps.fieldValue];
      this.setState({'suggestValue':suggestValue});
      reduxDispatch(reduxFormChange(tempName,suggestValue));
    }
  }

  onChange(value) {

    let index = Object.values(this.props.suggestData.object).indexOf(value);
    //document.getElementsByName("test234")[0].onChange(value);
  //  document.getElementsByName(this.props.tempName)[0].value=value;
  // console.log(this.state.suggestValue);
    if(index==undefined || index==-1)
    {
      this.props.input.onChange("");
      if(value=='')
      {
        this.setState({'bt_create':'hide'});
      }
      else {
        this.setState({'bt_create':''});
      }
    }
    else
    {
      let indexValue = Object.keys(this.props.suggestData.object)[index];
      this.props.input.onChange(indexValue);
      this.setState({'bt_create':'hide'});
    }
    this.setState({suggestValue:value});

    const {reduxDispatch,reduxFormChange} = this.props;
    reduxDispatch(reduxFormChange(this.props.tempName,value));

  }

  onCreateNew()
  {


    let btCreateNew = document.getElementById('btCreateNew_'+this.props.name);
    btCreateNew.disabled=true;
    let v=document.getElementsByName(this.props.tempName)[0].value;
    //
    let newFiledObj={};
    newFiledObj[this.props.extraInfo.keyField]=v;

    axios.post('/api/addInfo',{
      table: this.props.extraInfo.table,
      newFiledObj: newFiledObj
    })
    .then((response) => {
      if(response.data.success===true)
      {
        this.props.input.onChange(response.data.result.insertId);
        this.props.onGetRow()
        this.setState({'bt_create':'hide'});
      }
      btCreateNew.disabled=false;
    }) //.then
    .catch(function (error) {
      console.log(error);
      btCreateNew.disabled=false;
    })
  }

  render() {
    const { name, input, label, type, maxLength, meta: { touched, error, warning } } = this.props;
    let btCreateNew = 'btCreateNew_'+name;
    return (
      <FormGroup validationState={(touched && ((error && "error") || (null) )) || (null)}>
        <div>
          <ControlLabel>{this.props.label}</ControlLabel>{' '}{ touched && ((error && <Label bsStyle="danger">{error}</Label>) || (warning && <span>{warning}</span>))}

          <div>
          <div className="pull-left">
          <SSuggestor
           className="input-group"
           list={this.props.suggestData.array}
           placeholder={this.props.placeholder}
           arrow={true}
           close={true}
           value={this.state.suggestValue}
           onChange={this.onChange}
         />
         </div>&nbsp;&nbsp;
          <Button className="pull-left" bsStyle="warning" type="button" id={btCreateNew} name={btCreateNew} className={this.state.bt_create} onClick={this.onCreateNew} >新增</Button>
         </div>

         {/*因為refux-form本身就有 input.onChange事件,要避免被蓋過*/}
         <input type='hidden' id={name} name={name} {...input} />

          <Field type="hidden" id={this.props.tempName} component="input" name={this.props.tempName}
                value={this.state.suggestValue}/>
                <br/>
          <FormControl.Feedback />
        </div>
        <div className="clearfix"></div>


      </FormGroup>
    )
  }
}
////////////////////////////////////////////////////////////////////////////////


/*********************************
*  R-SuggestSel-2 (for Fields)
*********************************/

export const RSuggestSel2 = (props) => {
  let tempName='_cReatEneW_1049_'+props.name;
  let newprops=Object.assign(
    {
      'createNew':true,
      'tempName':tempName
    }, props);   //複製

  let names=[props.name,newprops.tempName];
  //newprops.createNew = true;
  let importValidataFuc= importValidata(newprops) ;
  //避免在 Field 里用 onChange 力
  return (
    <div>
      <Fields className = "form-control"  names={ names }
        component={ RSuggestSelComponent2 } validate={importValidataFuc}
        {...newprops}  >
      </Fields>
    </div>
)};

export class RSuggestSelComponent2 extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  componentWillMount() {
    this.setState({'suggestValue':''});
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.fieldValue!=this.props.fieldValue)
    {
      document.getElementsByName(this.props.tempName)[0].value='';
      let suggestValue = this.props.suggestData.object[nextProps.fieldValue];
      this.setState({'suggestValue':suggestValue});
      this.props[this.props.tempName].input.onChange(suggestValue);
    }
  }

  onChange(value) {
    let index = Object.values(this.props.suggestData.object).indexOf(value);
  //  document.getElementsByName(this.props.tempName)[0].value=value;
    if(index==undefined || index==-1)
    {
      this.props[this.props.name].input.onChange("");
    }
    else
    {
      let indexValue = Object.keys(this.props.suggestData.object)[index];
      this.props[this.props.name].input.onChange(indexValue);
    }
    this.setState({suggestValue:value});
    this.props[this.props.tempName].input.onChange(value);
  }

  render() {
    console.log(this.props);
    const { type, maxLength } = this.props;
    const { name, input, meta: { touched, error, warning } } = this.props[this.props.name];

    return (
      <FormGroup validationState={(touched && ((error && "error") || (null) )) || (null)}>
        <div>
          <ControlLabel>{this.props.label}</ControlLabel>{' '}{ touched && ((error && <Label bsStyle="danger">{error}</Label>) || (warning && <span>{warning}</span>))}
          <SSuggestor
           className="input-group"
           list={this.props.suggestData.array}
           placeholder={this.props.placeholder}
           arrow={true}
           close={true}
           value={this.state.suggestValue}
           onChange={this.onChange}
         />
         {/*因為refux-form本身就有 input.onChange事件,要避免被蓋過*/}


         <input type="text" id={this.props.tempName} name={this.props.tempName}
                value={this.state.suggestValue} {...this.props[this.props.tempName].input}

                />

         <input type='hidden1' id={name} name={name} {...input} />
          <FormControl.Feedback />
        </div>
      </FormGroup>
    )
  }
}
////////////////////////////////////////////////////////////////////////////////

export const RTextarea = (props) => {
  let readOnlyProperty='';
  if(props.readOnly) readOnlyProperty='readOnly';

  return (
    <FormGroup controlId={props.controlId}>
      <ControlLabel>{props.label}</ControlLabel>
      <Field className="form-control" name={props.name} component="textarea" readOnly={readOnlyProperty} />
    </FormGroup>
)};

export const renderFieldSelect = (props) => {
  //console.log(props);
  const { name, input, label, type, maxLength, meta: { touched, error, warning } } = props;
  return (
    <FormGroup validationState={(touched && ((error && "error") || (null) )) || (null)}>
      <div>
        <ControlLabel>{label}{name}</ControlLabel>{' '}{ touched && ((error && <Label bsStyle="danger">{error}</Label>) || (warning && <span>{warning}</span>))}
        <select name={name} id={name} className="form-control" placeholder={label}>
          {props.children}
        </select>
        <FormControl.Feedback />
      </div>
    </FormGroup>
)};


export const RSelect = (props) => {
  let importValidataFuc= importValidata(props) ;
  //避免在 Field 里用 onChange 力
  return (
    <div>
      <Field className = "form-control"  id={ props.name }  name={ props.name }
        component={ RSelectComponent } validate={importValidataFuc}
        onChangeSel={props.onChange} {...props}  >
      {props.children}
      </Field>
    </div>
)};

export class RSelectComponent extends Component {
  constructor(props) {
    super(props);
    this.onChangeSel = this.onChangeSel.bind(this);
  }

  onChangeSel(e) {
    const { input } = this.props;
    let _selVal=e.target.value;
    input.onChange(_selVal);
    //console.log(this.props);
    if(typeof(this.props.onChangeSel)=='function')
    {
      this.props.onChangeSel();
    }
  }


  render() {
    const { name, input, label, type, maxLength,onChange, meta: { touched, error, warning } } = this.props;
    return (
      <FormGroup style={{width:200}} validationState={(touched && ((error && "error") || (null) )) || (null)}>
        <div>
          <ControlLabel>{label}{name}</ControlLabel>{' '}{ touched && ((error && <Label bsStyle="danger">{error}</Label>) || (warning && <span>{warning}</span>))}
          <select name={name} className="form-control" placeholder={label} {...input} id={name} onChange={this.onChangeSel} >
            <option></option>
            {this.props.children}
          </select>
          <FormControl.Feedback />
        </div>
      </FormGroup>
    )
  }
}
////////////////////////////////////////////////////////////////////////////////

export const RTag = (props) => {
  let importValidataFuc= importValidata(props) ;
  //避免在 Field 里用 onChange 力
  return (
    <div>
      <Field className = "form-control"  id={ props.name }  name={ props.name }
        component={ RTagComponent } validate={importValidataFuc}
        onChangeSel={props.onChange} {...props}  >
      {props.children}
      </Field>
    </div>
)};

export class RTagComponent extends Component {
  constructor(props) {
    super(props);
    this.logChange = this.logChange.bind(this);
    this.promptTextCreator = this.promptTextCreator.bind(this);
    this.transToStr = this.transToStr.bind(this);
    this.transToArray = this.transToArray.bind(this);
  }

  componentWillMount() {


    this.setState({'value':''});
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.fieldValue!=nextProps.fieldValue)
    {
      this.props.input.onChange(nextProps.fieldValue);
    }
    let obj = [];
    obj=this.transToArray(nextProps.input.value,nextProps.suggestData);
    this.setState({'value':obj});
  }

  promptTextCreator(label) {
      return `新增${label}`;
  }

  logChange(value) {
    this.setState({ value });
    let is_new=false;
    let row = value;

    if(row)
    {
      for(let key in row)
      {
        if(row[key]['className'])
        {
          is_new=true;
          const p1 = new Promise((resolve,reject)=>{
            let newFiledObj={};
            newFiledObj[this.props.extraInfo.keyField]=row[key]['value'];

            axios.post('/api/addInfo',{
              table: this.props.extraInfo.table,
              newFiledObj: newFiledObj
            })
            .then((response) => {
              if(response.data.success===true)
              {
                row[key]['value']=response.data.result.insertId;
                this.props.onGetRow();
                resolve(row);
              }
            }) //.then
            .catch(function (error) {
              //console.log(error);
            })


          });

          p1.then((row)=>{


            let str = this.transToStr(row);
            this.props.input.onChange(str);

          }); //p1
        } //if
      } //for

      if(!is_new)
      {
        let str = this.transToStr(row);
        this.props.input.onChange(str);
      }
    } //if
  }

  transToStr(row)
  {
    let str='';
    if(row)
    {
      for(let key in row)
      {
        if(str) str+='|';
        str+=row[key]['value'];
      }
    }
    return str;
  }

  transToArray(str , suggestData)
  {

    if(!str) return null;
    let rows = str.split('|');
    let obj = [];
    for(let key in rows)
    {
      let val = rows[key];
      obj.push({'value':val,'label':suggestData.object[val]});
    }
    return obj;
  }

  render() {
    const { name, input, label, type, maxLength, suggestData,meta: { touched, error, warning } } = this.props;

    let options = [];

    for(let key in suggestData.object)
    {


      options.push({'value':key,'label':suggestData.object[key]});
    }

    return (
      <FormGroup validationState={(touched && ((error && "error") || (null) )) || (null)}>
        <div>
          <ControlLabel>{label}{name}</ControlLabel>{' '}{ touched && ((error && <Label bsStyle="danger">{error}</Label>) || (warning && <span>{warning}</span>))}

          <Select.Creatable
            placeholder={label}
            value={this.state.value}
            options={options}
            onChange={this.logChange}
            promptTextCreator={this.promptTextCreator}
            multi={true}
          />
          <input type="hidden" {...input} />
          <FormControl.Feedback />
        </div>
      </FormGroup>
    )
  }
}




////////////////////////////////////////////////////////////////////////////////

export const RCheckbox = (props) => {
  return (
    <div>
      <Field className = "form-control"  id={ props.name }  name={ props.name } component={ RCheckboxComponent }  {...props} />
    </div>
)};


export class RCheckboxComponent extends Component {
  constructor(props) {
    super(props);
    this.onChange=this.onChange.bind(this);
   }

  componentWillMount() {
    this.setState({Value:this.props.input.value});
    if(this.props.input.value=='1') {
      this.setState({'checked':true});
    }
    else {
      this.setState({'checked':false});
    }
  }

  componentWillReceiveProps(){

  }

  onChange(e)
  {
    let thisObj=e.target.id
    let Value = (document.getElementById(thisObj).checked) && '1' || '0';
    this.props.input.onChange(Value);
  }




  render() {
    const tempName=this.props.id+'_'+Math.random();
    let checked = this.props.input.value=='1' && true || false;

    return (
    <FormGroup>
      <Checkbox onChange={this.onChange} id={tempName} name={tempName} checked={checked}>
         {this.props.children}
      </Checkbox>{this.props.label}
      <input type="hidden" {...this.props.input}  />
    </FormGroup>
    )
  }
}


//http://pushtell.github.io/react-bootstrap-date-picker/
/*
<div>
  <Field {...props} className="form-control" label={props.label} name={props.name} id={props.name} component={RInputComponent} validate={validateFunc} />
</div>
*/
export const RDate = (props) => {
  return (
    <div>
      <Field className = "form-control"  id={ props.name }  name={ props.name } {...props} component={ RDateComponent } validate={importValidata(props)} />
    </div>
)};

export class RDateComponent extends Component {
  constructor(props) {
    super(props);
  this.onChange=this.onChange.bind(this);
  }

  componentDidUpdate(){}

  onChange(v,f)
  {
    this.props.input.onChange(f);
  }

  render() {
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
    let { name, input, label, type, maxLength, meta: { touched, error, warning } }=this.props;

    return (
    <FormGroup style={{width:200}} validationState={(touched && ((error && "error") || (null) )) || (null)}>
      <ControlLabel>{label}</ControlLabel>{' '}{touched && ((error && <Label bsStyle="danger">{error}</Label>) || (warning && <span>{warning}</span>))}
      <input type="hidden" {...this.props.input}   />
      <DatePicker dateFormat="YYYY/MM/DD" dayLabels={['日','一','二','三','四','五','六']} onChange={this.onChange} value={toISODateFormat(this.props.input.value)}  />
    </FormGroup>
    )
  }
}

export function fromISODateFormat(value=false){

  let TimeNow
  if(value)
  {
    TimeNow= new Date(value);
  }
  else {
    TimeNow= new Date();
  }


  var yyyy = TimeNow.getUTCFullYear();
  var MM = (TimeNow.getMonth()+1<10 ? '0' : '')+(TimeNow.getMonth()+1);
  var dd = (TimeNow.getDate()<10 ? '0' : '')+TimeNow.getDate();
  let newvalue=yyyy+'-'+MM+'-'+dd;
  return newvalue;
}

export function toISODateFormat(value){
  let  newvalue='';
  if(value && typeof(value)!='undefined')
  {
    if(value.indexOf('T')>0)
    {
      newvalue=value;
    }
    else {

      let TimeNow = new Date(value);
      var yyyy = TimeNow.getUTCFullYear();
      var MM = (TimeNow.getMonth()+1<10 ? '0' : '')+(TimeNow.getMonth()+1);
      var dd = (TimeNow.getDate()<10 ? '0' : '')+TimeNow.getDate();
      newvalue=yyyy+'-'+MM+'-'+dd+'T04:00:00.000Z';

    //  newvalue= new Date(value).toISOString();
    }
  }
  else {
    newvalue='';
  }
  return newvalue;
}






export const RInsert = (props) => {
  return (
    <div>
      <Field className = "form-control"  id={ props.name }  name={ props.name } component={ RInsertComponent }  {...props} />
    </div>
)};

const RInsertComponent = (props) => {
  const tempName=props.id+'_'+Math.random();
  let { input } = props;

  function insertTextarea(e)
  {
    let { input }=props;
    document.getElementById(props.id).value+=
    document.getElementById(tempName).value+'\r\n';
    input.onChange(document.getElementById(props.id).value);
  }

  return (
    <FormGroup>
      <label className="control-label">{props.label}</label>
      <Row >
        <Col sm={10}>
          <select placeholder="select" name={ tempName } id={ tempName } className="form-control">
            { props.children }
          </select>
        </Col>
        <Col sm={1}>
          <Button  onClick={ insertTextarea }>插入</Button>
        </Col>
      </Row>
      <div style={{padding:3}}  />
      <textarea id={ input.name }  placeholder={props.label} value={ input.value || "" } {...input} className="form-control"></textarea>
    </FormGroup>
  )
}













//////////////////////////

export class RFile extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let importValidataFuc=importValidata(this.props);
    return (
      <Field {...this.props} className="form-control" label={this.props.label} name={this.props.name} component={RFileComponent} validate={importValidataFuc} showModal={this.showModal}/>
    )
  }
}

export class RFileComponent extends Component {
  constructor(props) {
    super(props);
    this.hideModal=this.hideModal.bind(this);
    this.showModal=this.showModal.bind(this);
    this.uploadFile=this.uploadFile.bind(this);
    this.showAtt = this.showAtt.bind(this);

    let uploadFileName='_upload_files_'+Math.floor(Math.random()*1000000);
    this.config = {uploadFileName:uploadFileName};
  }

  componentWillMount() {
    this.hideModal();
  }

  showAtt() {
    if(this.props.input.value!="")
    {
      let url='/files/'+this.props.input.value;
      let win = window.open(url, '_blank');
      win.focus();
    }
  }

  showModal() {
    this.setState({isShowModal: true, uploadFileName:this.config.uploadFileName});
  }

  hideModal() {
    this.setState({isShowModal: false});
  }

  uploadFile(e) {
    let parentThis=this;

    let data = new FormData();

    data.append('upload', document.getElementById(this.config.uploadFileName).files[0]);

    let config = {
      headers: { 'encType': 'multipart/form-data' }
    };

    /*** 測試數據 ***
    let targetFile='1098_m_1488706859762.jpg'
    //document.getElementById(parentThis.props.input.name).value=targetFile;
    parentThis.props.input.onChange(targetFile);
    parentThis.hideModal();
    return ;
    /*** 測試數據 ***/

    axios.post('/uploadFile', data , config)
      .then(function (res) {
        let targetFile=res.data.targetFile;
        //document.getElementById(parentThis.props.input.name).value=targetFile;
        parentThis.props.input.onChange(targetFile);
        parentThis.hideModal();
      })
      .catch(function (err) {
        console.log(err.message);
      });
  }

  render(){
      const { name, input, label, type, maxLength, showModal, meta: { touched, error, warning } } = this.props;
      return (
      <div>
        <FormGroup controlId={name} validationState={(touched && ((error && "error") || (null) )) || (null)}>
        <div style={{width:400}}>
          <ControlLabel>{label}</ControlLabel>{' '}{touched && ((error && <Label bsStyle="danger">{error}</Label>) || (warning && <span>{warning}</span>))}
          <span className="input-group" >
            <span className="input-group-btn">
              <button type="button" className="btn btn-default" onClick={this.showModal}>上傳</button>
            </span>
            <input className="form-control" id={input.name} {...input}  placeholder={label} type={type} maxLength={maxLength}/>
            <span className="input-group-btn">
            {
              this.props.input.value &&  (
                <button type="button" className="btn btn-default" onClick={this.showAtt}><span className="glyphicon glyphicon-eye-open"></span></button>
              )
            }

              <button type="button" className="btn btn-default" onClick={this.showModal}><span className="glyphicon glyphicon-folder-open"></span></button>
            </span>
          </span>
        </div>
      </FormGroup>
      <Modal show={this.state.isShowModal} onHide={this.hideModal}>
        <Modal.Header closeButton>
          <Modal.Title>請選擇上傳的檔案</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input type="file" name={this.state.uploadFileName} id={this.state.uploadFileName} className="form-control" />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.hideModal}>取消</Button>
          <Button onClick={this.uploadFile} bsStyle="primary">確認上傳</Button>
        </Modal.Footer>
      </Modal>
      </div>
    );
  }
}

export const FormFieldComponet = (props) => (
  <FormGroup controlId={ props.name }>
    <ControlLabel>{props.label}</ControlLabel>
      <FormControl type={props.type} placeholder={props.placeholder}>
      </FormControl>
    </FormGroup>
);

export const FormTextarea = (props) => (
  <FormGroup controlId="{props.controlId}">
    <ControlLabel>{props.Label}</ControlLabel>
    <FormControl componentClass="textarea" placeholder={props.placeholder}/><HelpBlock></HelpBlock>
  </FormGroup>
)

export const FormField = (props) => (
  <div>
    <FormGroup controlId="{props.controlId}">
      <ControlLabel>{props.Label}</ControlLabel>
      <FormControl/><HelpBlock></HelpBlock>
    </FormGroup>
  </div>
);

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
  let TimeNow = new Date(cell);
  var yyyy = TimeNow.toLocaleDateString().slice(0,4)
  var MM = (TimeNow.getMonth()+1<10 ? '0' : '')+(TimeNow.getMonth()+1);
  var dd = (TimeNow.getDate()<10 ? '0' : '')+TimeNow.getDate();
  let Value=yyyy+'-'+MM+'-'+dd;
  return Value;

  //let cellRow=cell.split('T');
  //return cellRow[0];
}

export class TableAndField extends Component {
  constructor(props){
    super(props);
  }

  render()
  {
    return (
      <div>
        <ModalBlock {...this.props} />
        <AlertBlock {...this.props} />
        <TableAndFieldList ref='TableAndFieldListRef' {...this.props} />
        <TableAndFieldEdit {...this.props} TableAndFieldListRef={this.refs.TableAndFieldListRef} />
      </div>
    );
  }
}


export class TableAndFieldEdit extends Component {
  constructor(props) {
    super(props);
    this.mySubmitMethod=this.mySubmitMethod.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    switch(nextProps.actionMode)
    {
      case "List":
        if(this.props.Field!='List')
        {
          return true;
        }
        else {
          return false;
        }
      break;

      default:
      case "Field":
        return true;
      break;
    }
  }

  mySubmitMethod(values) {
    const { FieldData } = this.props;
    let rows=values.toJS();
    let errObj={}, createObj={};

    FieldData.map(obj=>{
      let filedName=obj.name;

      //若是新創時
      if(obj.isKey && this.props.actionType=='create'){
        let DBStore=this.props.TableAndFieldListRef.refs.BootstrapTabletableRef.store.data;
        DBStore.map(subObj=>{
          if(subObj[filedName]==rows[filedName])
          {
            errObj[filedName]='已存在相同值'+rows[filedName];
            errObj['_error']='failed!';
            throw new SubmissionError(errObj);
          }
        });
      }

      //若是有特別的資料結構
      if(obj.hasOwnProperty('dateType')) {
        switch(obj.dateType)
        {
          case 'carNo':

            let _carNo=rows[filedName];

            if(_carNo && _carNo.length>0)
            {
              _carNo = _carNo.replace('-','');
              switch(_carNo.length)
              {
                case 4:
                case 5:
                  _carNo = _carNo.substr(0,2)+'-'+_carNo.substr(2);
                break;

                case 6:
                case 7:
                  _carNo = _carNo.substr(0,3)+'-'+_carNo.substr(3);
                break;

                default:
                  errObj[filedName]='車牌長度不正確';
                  errObj['_error']='failed!';
                  throw new SubmissionError(errObj);
                break;
              }
              if(_carNo!=rows[filedName])
              {
                errObj[filedName]='車牌格式不正確,你是否要填寫'+_carNo+'?';
                errObj['_error']='failed!';
                throw new SubmissionError(errObj);
              }
            }
          break;

          default:
          break;
        }
      }
    })

    let valueJS = fromJS(rows);

    const p1 = new Promise((resolve,reject)=>{
      let resultObj={};
      resolve(resultObj);
    });

    p1.then((resultObj)=>{
      if(this.props.actionType=='create')
      {
        //Notice: 不要寫成 values.toJS()
        this.props.onAddRow(valueJS);
      }
      else {
        this.props.onSetRow(rows);
      }

      this.props.onFieldCancel();
    });}

  render(){
    const { handleSubmit , FieldData , SelectedRow} = this.props;
    let columnClassName;
    switch(this.props.actionMode)
    {
      case "Field":
        columnClassName='';
      break;

      default:
      case "List":
        columnClassName='hidden';
      break;
    }

    return (
      <div className={columnClassName}>
        <form onSubmit={handleSubmit(this.mySubmitMethod)} name="MyForm" id="MyForm">
        <Panel>
          <ButtonToolbar className='text-right'>
            <Button bsStyle="success" bsSize='lg' type="submit">儲存</Button>
            <Button bsStyle="default" bsSize='lg' onClick={this.props.onFieldCancel}>取消</Button>
          </ButtonToolbar>
        {
          /* ======================================
          // 從選擇的SelectedRow找到對應的value
          // 用於非 Field 的 data , 如readonly中正規的值
          // 真正的值会由 onRowSelect（由BootstrapTable中的option selectRow ) 这事件触发后
          // 透过 this.props.onSetSelectedInfo(row) 写到 Field 里
          // ======================================*/


          FieldData.map(obj=>{
            let value='';
            value = SelectedRow && SelectedRow[obj.name];

            let readOnlyForEdit =obj.readOnlyForEdit;
            let checkDuplicate ; //此参数只根据是否为主键isKey来决定

            if(this.props.actionType=='create' && obj.hasOwnProperty('readOnlyForEdit'))
            {
              readOnlyForEdit=undefined;
            }

            if(obj.hasOwnProperty('isKey'))
            {
              if(this.props.actionType=='update')
              {
                checkDuplicate=false;
                readOnlyForEdit=true;
              }
              else if(this.props.actionType=='create'){
                checkDuplicate=true;
                readOnlyForEdit=false;
              }
            }

            let formatExtraDataObj=[];

            if(obj.required){
             obj.label = '*'+obj.label;
            }

            if(obj.hasOwnProperty('dateType') && obj.dateType=='carNo')
            {
              obj.toUpperCase=true;
            }

            if(obj.hasOwnProperty('tablehide'))
            {
              //編輯畫面不顯示
              obj.type='hide';
            }

            switch(obj.type)
            {
              case "RInput":
                let DBStore={};
                if(this.props.hasOwnProperty('TableAndFieldListRef') && typeof(this.props.TableAndFieldListRef)!='undefined')
                {
                    DBStore=this.props.TableAndFieldListRef.refs.BootstrapTabletableRef.store.data;
                }


                return (<RInput key={obj.name}
                          name={obj.name}
                          isKey={obj.isKey}
                          label={obj.label}
                          number={obj.number}
                          required={obj.required}
                          unique={obj.unique}
                          maxLength={obj.maxLength}
                          pointLength={obj.pointLength}
                          readOnlyForEdit={readOnlyForEdit}
                          checkDuplicate={checkDuplicate}
                          toUpperCase={obj.toUpperCase}
                          fieldValue={value}
                          readOnly={obj.readOnly}
                          DBStore={DBStore} />)
                          break;

              case "RTag":
                return (<RTag key={obj.name}
                          name={obj.name}
                          isKey={obj.isKey}
                          label={obj.label}
                          number={obj.number}
                          required={obj.required}
                          unique={obj.unique}
                          maxLength={obj.maxLength}
                          pointLength={obj.pointLength}
                          readOnlyForEdit={readOnlyForEdit}
                          checkDuplicate={checkDuplicate}
                          toUpperCase={obj.toUpperCase}
                          fieldValue={value}
                          suggestData={obj.suggestData}
                          extraInfo={obj.extraInfo}
                          onGetRow={this.props.onGetRow}
                          list={obj.list} />)
                          break;

              case "RSuggest":
                return (<RSuggest key={obj.name}
                          name={obj.name}
                          isKey={obj.isKey}
                          label={obj.label}
                          number={obj.number}
                          required={obj.required}
                          unique={obj.unique}
                          maxLength={obj.maxLength}
                          pointLength={obj.pointLength}
                          readOnlyForEdit={readOnlyForEdit}
                          checkDuplicate={checkDuplicate}
                          toUpperCase={obj.toUpperCase}
                          fieldValue={value}
                          list={obj.list} />)
                          break;

            case "RSuggestSel":
              return (<RSuggestSel key={obj.name}
                        name={obj.name}
                        isKey={obj.isKey}
                        label={obj.label}
                        number={obj.number}
                        required={obj.required}
                        unique={obj.unique}
                        maxLength={obj.maxLength}
                        pointLength={obj.pointLength}
                        readOnlyForEdit={readOnlyForEdit}
                        checkDuplicate={checkDuplicate}
                        toUpperCase={obj.toUpperCase}
                        fieldValue={value}
                        suggestData={obj.suggestData}
                        extraInfo={obj.extraInfo}
                        reduxFormChange={this.props.change}
                        reduxDispatch={this.props.dispatch}
                        onGetRow={this.props.onGetRow}
                        />)
                        break;

              case "RFile":
                return (<RFile
                          key={obj.name}
                          name={obj.name}
                          label={obj.label}
                          number={obj.number}
                          required={obj.required}
                          unique={obj.unique}
                          readOnlyForEdit={readOnlyForEdit}
                          fieldValue={value} />)
              break;

              case "RTextarea":
                return (<RTextarea
                          key={obj.name}
                          name={obj.name}
                          label={obj.label}
                          number={obj.number}
                          required={obj.required}
                          unique={obj.unique}
                          maxLength={obj.maxLength}
                          readOnlyForEdit={readOnlyForEdit}
                          readOnly={obj.readOnly}
                          fieldValue={value|''}  />)
              break;

              case "RDate":
                return (<RDate
                          key={obj.name}
                          name={obj.name}
                          label={obj.label}
                          number={obj.number}
                          required={obj.required}
                          unique={obj.unique}
                          maxLength={obj.maxLength}
                          readOnlyForEdit={readOnlyForEdit}
                          fieldValue={value}
                           />)
              break;

              case "RCheckbox":
                return (<RCheckbox
                          key={obj.name}
                          name={obj.name}
                          number={obj.number}
                          required={obj.required}
                          unique={obj.unique}
                          maxLength={obj.maxLength}
                          readOnlyForEdit={readOnlyForEdit}
                          fieldValue={value|''} > {obj.label} </RCheckbox>)
              break;

              case "RSelect":

                if(typeof(obj.formatExtraData)!='undefined')
                {
                  if(Object.prototype.toString.call( obj.formatExtraData ) === '[object Array]')
                  {
                    for(let key in obj.formatExtraData)
                    {
                      formatExtraDataObj[key]={value:key,title:obj.formatExtraData[key]};
                    }

                  }
                  else if(Object.prototype.toString.call( obj.formatExtraData ) === '[object Object]')
                  {
                    let index=0;
                    for(let key in obj.formatExtraData)
                    {
                      formatExtraDataObj[index++]={value:key,title:obj.formatExtraData[key]};
                    }
                  }

                }

                return (<RSelect
                          key={obj.name}
                          name={obj.name}
                          label={obj.label}
                          number={obj.number}
                          required={obj.required}
                          unique={obj.unique}
                          maxLength={obj.maxLength}
                          readOnlyForEdit={readOnlyForEdit}
                          onChange={obj.onChange}
                          fieldValue={value|''}
                          >
                          {
                            formatExtraDataObj.map((obj)=>(<option value={obj.value} key={obj.value}>{obj.title}</option>))
                          }
                          </RSelect>
                        )
              break;

              case "RInsert":
                if(typeof(obj.formatExtraData)!='undefined')
                {
                  for(let key in obj.formatExtraData)
                  {
                    formatExtraDataObj[key]={value:key,title:obj.formatExtraData[key]};
                  }
                }
                return (<RSelect
                          key={obj.name}
                          name={obj.name}
                          label={obj.label}
                          number={obj.number}
                          required={obj.required}
                          unique={obj.unique}
                          maxLength={obj.maxLength}
                          readOnlyForEdit={readOnlyForEdit}
                          fieldValue={value|''}
                          >
                          {
                            formatExtraDataObj.map((obj)=>(<option value={obj.value} key={obj.value}>{obj.title}</option>))
                          }
                          </RSelect>
                        )
              break;
            }
          })
        }
          <ButtonToolbar className='text-right'>
            <Button bsStyle="success" bsSize='lg' type="submit">儲存</Button>
            <Button bsStyle="default" bsSize='lg' onClick={this.props.onFieldCancel}>取消</Button>
          </ButtonToolbar>
        </Panel>
        </form>
      </div>
    );
  }
}

export class TableAndFieldList extends Component {
  constructor(props) {
    super(props);
    this.onCreateBTClick=this.onCreateBTClick.bind(this);
    this.onEditBTClick=this.onEditBTClick.bind(this);
    this.onRowSelect = this.onRowSelect.bind(this);
    this.onRowDoubleClick = this.onRowDoubleClick.bind(this);
    this.applyFilter = this.applyFilter.bind(this);
    this.onAdvaSearchBTClick = this.onAdvaSearchBTClick.bind(this);
    this.applyClearFilter = this.applyClearFilter.bind(this);
    this.expandComponent = this.expandComponent.bind(this);
   }

   componentWillMount() {
     this.setState({'AdvantageSearchClass':'hide'});
   }

  componentDidMount() {
    const { BootstrapOptions } = this.props;
    //預設的篩選條件
    if(typeof(this.props.DefaultFilterValue)!='undefined')
    {
      for(let index in this.props.DefaultFilterValue)
      {
        let value= this.props.DefaultFilterValue[index].toString();
        this.refs[index].applyFilter(value);
      }
    }

    /*============================
    //  處理搜尋按鈕
    //============================*/
      //hide react-boostrap-table's serach field
      let is_filter_enable=false;
     $('.text-filter').each(function(){
       $(this).addClass('hide');
       is_filter_enable=true;
     });

     /*
  直接在css做修改了 */
     let formgroupbtn =  $('div.react-bs-table-tool-bar > div.row > div:nth-child(2)');
//     $('.react-bs-table-search-form').removeClass('form-group-sm').removeClass('input-group-sm').addClass('form-group-xlg').addClass('input-group-xlg');

     let groupbtn = formgroupbtn.find('span.input-group-btn');
     groupbtn.find('button').html('清除');

     //如果有進階搜尋功能才會開啟按鈕
     if(is_filter_enable)
     {
       groupbtn.append('<button id="BTAdvaSearch" class="btn btn-default" type="button">進階搜尋</button>');
       $('#BTAdvaSearch').click(this.onAdvaSearchBTClick);
     }


    /*============================
    //  處理功能按鈕類
    //============================*/

    //新增
    let addButton=$('#BootstrapTabletableRefAll').find('.react-bs-table-add-btn');
    if($(addButton).attr('data-toggle')!="")
    {
      $(addButton).attr('data-toggle','').click(this.onCreateBTClick);
    }

    if(BootstrapOptions.editMode!='clickRow')
    {
      //編輯 , 會隨著有無被選取（onRowSelect）決定是否致能
      let html=`<button type="button" class="btn btn-edit-after-sel react-bs-table-edit-btn disabled" id="bt_edit">
                  <i class="glyphicon glyphicon-pencil"></i>編輯</button>`;

      $('.btn-group').append(html).removeClass('btn-group-sm').addClass('btn-group-xlg');
      $('.react-bs-table-edit-btn').click(this.onEditBTClick);
    }

  }

  onAdvaSearchBTClick() {
    if(this.state.AdvantageSearchClass=='hide')
    {
      this.setState({'AdvantageSearchClass':''});
    }
    else {
      this.setState({'AdvantageSearchClass':'hide'});
    }
  }

  onCreateBTClick() {
    //清完數據
    let rows={};

    this.props.FieldData.map(obj=>{
      if(obj.defaultFieldValue && obj.defaultFieldValue!='')
      {
        rows[obj.name]=obj.defaultFieldValue;
      }
      else {
        rows[obj.name]='';
      }

    })

    this.props.onSetSelectedInfo(rows);
    //進到編輯畫面

    this.props.onAfterEditBTClick('create');
  }

  //在點擊編輯按鈕後
  onEditBTClick(){
    this.props.onAfterEditBTClick('update');
  }

  onRowDoubleClick(row){
    if(this.props.BootstrapOptions.editMode=='clickRow'){
      this.onEditBTClick();
    }
  }


  onRowSelect(row, isSelected, e){
    /* 目前在點擊列時, 會觸發
      onRowClick(react-boostrap-table-plugins.js) 以及
      onRowSelect（由BootstrapTable中的option selectRow 定義, BootstrapReduxForm.js）
    */


    //將值先寫入欄位
    this.props.onSetSelectedInfo(row);
    if(this.props.BootstrapOptions.editMode!='clickRow'){
      //處理編輯的按鈕是否可以按
      if(isSelected)
      {
        $('.btn-edit-after-sel').removeClass('disabled');
      }
      else {
        $('.btn-edit-after-sel').addClass('disabled');
      }
    }

  }

  applyClearFilter() {
    let ParentThis = this;
    $('.input-filter').each(function(){
        let refsName= this.id.replace('_filter_','');
        $(this).val('');
        ParentThis.refs[refsName].cleanFiltered();
    });
  }

  applyFilter() {
    let ParentThis = this;
    $('.input-filter').each(function(){
      if(this.value)
      {
        let refsName= this.id.replace('_filter_','');
        ParentThis.refs[refsName].applyFilter(this.value);
      }
    });
  }

  isExpandableRow(row){
    return false;
  }

  expandComponent(row){
    return (
      <div>testok</div>
    );
  }

  render() {
    const { BootstrapTableData , FieldData , actionMode , BootstrapOptions , SelectedRow   } = this.props

    FieldData.map(obj=>{
      if(obj.name=='sort')
      {
        BootstrapOptions['sortName']='sort';
        BootstrapOptions['sortOrder']='desc';
      }
    });

    BootstrapOptions['expanding']=[1,2];
    //双击, 在BootstrapReduxForm中定义
    BootstrapOptions['onRowDoubleClick']=this.onRowDoubleClick;

    let selectRowObj={ mode: 'radio' , clickToSelect: true , onSelect: this.onRowSelect }

    let BootstrapTableClass;
    switch(this.props.actionMode)
    {
      case "Field":
        BootstrapTableClass='hidden';

      break;

      default:
      case "List":
        BootstrapTableClass='';
      break;
    }

    return (
      <div>
      {/*
      //    開始處理篩選條件
      */}
      <div className={this.state.AdvantageSearchClass} id="serchField" name="serchField">
        <Panel header="進階搜尋">
        <Form horizontal>
          {
            FieldData.map(obj=>{
              if(typeof(obj.filter)!='undefined' )
              {
                let fieldName='_filter_'+obj.name;

                switch(obj.type)
                {
                  case "RSelect":
                  let formatExtraDataObj=[];
                  if(typeof(obj.formatExtraData)!='undefined')
                  {
                    for(let key in obj.formatExtraData)
                    {
                      formatExtraDataObj[key]={value:key,title:obj.formatExtraData[key]};
                    }
                  }

                    return(
                    <FormGroup controlId={fieldName} key={fieldName}>
                      <Col sm={2} componentClass={ControlLabel}>{obj.label}</Col>
                      <Col sm={8}>
                        <FormControl componentClass="select" placeholder="select" bsClass="form-control input-filter">
                          <option value=""></option>
                          {
                            Object.keys(obj.formatExtraData).map(
                              (keyId) => {
                                  return (
                                    <option key={keyId} value={keyId}>{obj.formatExtraData[keyId]}</option>)
                                }
                            )
                          }
                        </FormControl>
                      </Col>
                    </FormGroup>);
                  break;

                  default:
                    return (
                      <FormGroup controlId={fieldName} key={fieldName}>
                        <Col sm={2} componentClass={ControlLabel}>{obj.label}</Col>
                        <Col sm={8}>
                          <FormControl type="text" bsClass="form-control input-filter" />
                        </Col>
                      </FormGroup>
                    )
                  break;
                }
              }
            })
          }
          <ButtonToolbar className='text-right'>
            <Col xs={4} xsOffset={6} >
            <Button bsSize='lg' type="button" onClick={this.onAdvaSearchBTClick}>隱藏</Button>
            <Button bsSize='lg' type="button" onClick={this.applyClearFilter}>清除</Button>
            <Button bsStyle="success" bsSize='lg' type="button" onClick={this.applyFilter}>篩選</Button>
            </Col>
          </ButtonToolbar>
        </Form>
        </Panel>
      </div>

      <div className={BootstrapTableClass} ref='BootstrapTabletableRefAll' id="BootstrapTabletableRefAll">
        <BootstrapTable
          ref='BootstrapTabletableRef'
          data={ BootstrapTableData }
          options={ BootstrapOptions }
          expandableRow = { this.isExpandableRow  }
          expandComponent={ this.expandComponent }
          insertRow deleteRow search pagination hover
          searchPlaceholder='請輸入查詢的關鍵字...'
          selectRow={selectRowObj}
          condensed

        >
          {
            FieldData.map(obj=>{
              let hidden = false;
              if(typeof(obj.listhide)!='undefined') hidden = true;

              let dataFormat=normalFormatter;

              if(typeof(obj.dataFormat)!='undefined') dataFormat = obj.dataFormat;

              let formatExtraData={};
              let filter={};  ///篩選條件

              switch(obj.type)
              {
                case "RCheckbox":
                case "RSuggestSel":
                case "RSuggest":
                case "RInput":
                case "RTag":
                case "RFile":
                case "RSelect":
                case "RInsert":
                  if(typeof(obj.formatExtraData)!='undefined' )
                  {
                    formatExtraData=obj.formatExtraData;
                    //normalFormatter / enumFormatter / dateFormatter
                    if(typeof(obj.dataFormat)=='undefined')
                    {
                      dataFormat=enumFormatter;
                    }
                    else if (obj.dataFormat=='normalFormatter' )
                    {
                      dataFormat=normalFormatter;
                    }
                  }

                  if(typeof(obj.filter)!='undefined' )
                  {
                    filter=obj.filter;
                  }

                  return (<TableHeaderColumn key={obj.name}
                    dataField={obj.name} isKey={obj.isKey} hidden={hidden}
                    dataFormat={ dataFormat }
                    formatExtraData={ formatExtraData }
                    dataSort={ true }
                    ref={obj.name}
                    filter={ filter }
                    width={obj.width}
                    className={obj.columnClassName}
                    columnClassName={obj.columnClassName}
                    >
                    {obj.label}
                    </TableHeaderColumn>)
                  break;

                case "RDate":
                  return (<TableHeaderColumn key={obj.name}
                    dataField={obj.name} isKey={obj.isKey} hidden={hidden}
                    dataFormat={ dateFormatter }
                    formatExtraData={ formatExtraData }
                    dataSort={ true }
                    width={obj.width}
                    className={obj.columnClassName}
                    columnClassName={obj.columnClassName}
                    >
                    {obj.label}
                    </TableHeaderColumn>)
                  break;

                case "RTextarea":
                  return (<TableHeaderColumn key={obj.name}
                    dataField={obj.name} isKey={obj.isKey} hidden={ hidden } dataSort={ true }
                    width={obj.width}
                    className={obj.columnClassName}
                    columnClassName={obj.columnClassName}
                    >
                    {obj.label}
                    </TableHeaderColumn>)
                  break;
              }
            })
          }
        </BootstrapTable>
      </div>


      </div>
    )
  }
}

export class AlertBlock extends Component {
  constructor(props){
    super(props)
    this.handleAlertDismiss = this.handleAlertDismiss.bind(this);
  }

  handleAlertDismiss()
  {
    let payload={'key':'alert','value':{'alertVisible':false}};
    this.props.onSetUI(payload);
  }

  render()
  {
    let alert={'alertVisible':false};
    if(typeof(this.props.uiRows)!='undefined')
    {
      let uiRows = this.props.uiRows.toJS() || {};
      if(uiRows['alert'])
      {
        alert=uiRows['alert'];
      }
    }

    return (
      <div>
        <div style={{padding:5}}  />
        {
          alert.alertVisible &&
          <Alert bsStyle={alert.bsStyle} onDismiss={this.handleAlertDismiss}>
            <h4>{alert.title}</h4>
            <p>{alert.message}</p>
          </Alert>
        }
      </div>
    )
  }
}

export class ModalBlock extends Component {
  constructor(props){
    super(props)
    this.handleModalDismiss = this.handleModalDismiss.bind(this);
  }

  handleModalDismiss()
  {
    let payload={'key':'modal','value':{'modalVisible':false,'handleModalClickClass':'hide'}};
    this.props.onSetUI(payload);
  }

  render()
  {
    let modal={'modalVisible':false};
    if(typeof(this.props.uiRows)!='undefined')
    {
      let uiRows = this.props.uiRows.toJS() || {};
      if(uiRows['modal'])
      {
        modal=uiRows['modal'];
      }
    }

    return (
      <Modal
         show={modal.modalVisible}
         onHide={this.handleModalDismiss}
         aria-labelledby="contained-modal-title"
       >
         <Modal.Header closeButton>
           <Modal.Title id="contained-modal-title">{modal.title}</Modal.Title>
         </Modal.Header>
         <Modal.Body>{modal.body}</Modal.Body>
         <Modal.Footer>
           <Button onClick={modal.handleModalClick} className={this.handleModalClickClass} bsSize="large" bsStyle="success">確認</Button>
           <Button onClick={this.handleModalDismiss} bsSize="large" bsStyle="danger">取消</Button>
         </Modal.Footer>
       </Modal>
    )
  }
}
