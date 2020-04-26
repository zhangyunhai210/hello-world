import React, { Component } from 'react'
import '../style/list.css'

class List extends Component {
    constructor(props){
        super(props)
        this.state ={
            valueConfig: false,
            value: props.value
        }
    }
    checkFinish(list, e) {
        list.isFinish = !list.isFinish
        this.setState({
            value: list
        })
    }

    changeConfig(list, e) {
        list.context = list.context.trim()
        this.setState({
            value: list,
            valueConfig: !this.state.valueConfig
        })
    }

    changeValue(list, e) {
        let context = e.target.value
        list.context = context
        this.setState({
            value: list
        })
    }

    render(){
     return(
        <dd onContextMenu={(e)=>this.props.method(this.state.value,e)}>
            <input type='checkbox' checked={this.state.value.isFinish?true:false} onChange={(e)=>this.checkFinish(this.state.value, e)}/>
            {
                this.state.valueConfig?'':<span onClick={(e)=>this.changeConfig(this.state.value, e)} className={this.state.value.isFinish?'finish':''}>{this.state.value.context}</span>
            }
           {
               this.state.valueConfig?<input type='text' autoFocus={true} onBlur={(e)=>{this.changeConfig(this.state.value, e)}} onChange={(e)=>{this.changeValue(this.state.value, e)}} value={this.state.value.context} />:''
           } 
        </dd>
     )
    }
          
}

export class MyLists extends Component {
    constructor(props) {
        super(props)
        this.state = {
            Lists: props.data.todo,
            addValue: '',
            listenerFnc : ()=>{},
        }
        this.listenerFnc = ()=>{}
    }

    getList(list){
        function removeList(list, e) {
            let listIndex = this.state.Lists.findIndex((node)=>{
                return list.id === node.id
            })
            this.state.Lists.splice(listIndex,1)
            this.setState({
                Lists: this.state.Lists
            })
        }

        function oncontextmenu(list, e){
            e.preventDefault();
            let listenerFnc = this.listenerFnc
            let body = document.querySelector('body')
            let menu = document.getElementById('menu')
            let {clientX, clientY} = e
            let deleteMenu = menu.firstChild
            let removeFnc = removeList.bind(this,list)
            let bodyListener = function(listenerFnc){
                menu.style.visibility = 'hidden'
                deleteMenu.removeEventListener('click', listenerFnc)
                listenerFnc = null
            }
            if(listenerFnc)deleteMenu.removeEventListener('click', listenerFnc)
            menu.style.visibility = 'visible'
            menu.style.left = `${clientX}px`
            menu.style.top = `${clientY}px`
            deleteMenu.addEventListener('click',removeFnc,{once: true})
            this.listenerFnc = removeFnc
            body.addEventListener('click', bodyListener.bind(this, listenerFnc), {once: true})
        }

        return(
            <List method={oncontextmenu.bind(this)} key={list.id} value={list}  />
        )
    }

    changeValue(e) {
        let context = e.target.value
        this.setState({
            addValue: context
        })
    }

    addTodo(e){
        let value = e.target.value.trim()
        if(!value){
            this.setState({
                addValue: ''
            })
            return
        }
        let addList = {
            id: this.state.Lists[this.state.Lists.length-1].id+1,
            context:value,
            isFinish: false,
        }
        this.state.Lists.push(addList)
        this.setState({
            Lists: this.state.Lists,
            addValue: ''
        })
    }

    render() {
        return (
            <dl>
                <ul id='menu' className='hidden'>
                    <dt>删除待办事项</dt>
                </ul>
                <dt>{this.props.data.name}</dt>
                    <dd className='baseAdd addTask'>
                        <input id="baseAddInput-addTask"
                         className="baseAdd-input chromeless" aria-label="添加任务"
                         onBlur={(e)=>{this.addTodo(e)}}
                         onKeyUp={(e)=>{if(e.keyCode===13)e.target.blur()}}
                         aria-describedby="baseAddInput-addTask-description"
                         type="text"
                         maxLength="255"
                         placeholder="添加任务"
                         onChange={(e)=>{this.changeValue(e)}}
                         value={this.state.addValue}></input>
                    </dd>
                    {
                        this.state.Lists.map((list)=>{
                            return this.getList(list)
                        })
                    }
            </dl>
        )
    }
}

export default MyLists
