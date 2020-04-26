import React,{Component} from 'react';
import logo from './logo.svg';
import './App.css';
import MyLists from './template/MyList'
let TODO_LIST = {
  name: 'defalut',
  todo: [
    {
      id:0,
      isFinish: false,
      context: '1'
    },
    {
      id:1,
      isFinish: false,
      context: '2'
    },
    {
      id:2,
      isFinish: true,
      context: '3'
    },
  ]
}

export default class App extends Component {
  render() {
    return (
      <div>
        <MyLists data={TODO_LIST}></MyLists>
      </div>
    )
  }
}