import * as React from "react"
import { fromEvent } from 'rxjs';
import { map } from 'rxjs/operators'
import { Visitor } from './visitor'
import {Interpreter} from './interpreter'
import "./fonts.scss"
const acorn = require('acorn')

const jsInterpreter = new Interpreter(new Visitor())

const keyStorage = new Array()
let count = 0
function App() {
  const inputRef = React.useRef('');

  const [inputValue, setInputValue] = React.useState('');
  const [data, setData] = React.useState([]);

  const updateInput = () => setInputValue(inputRef.current.value);

  React.useEffect(() => {
    inputRef.current.focus();
    var inputEvent$ =  fromEvent(inputRef.current , 'keyup').pipe(
      map(event => {
        const {target: {
          value
        } = {}, key, shiftKey} = event
        
        event.preventDefault(); 
        return {value, key, shiftKey}
      })
    )

    inputEvent$.subscribe(({value, key, shiftKey}) => {
      if (key === 'Enter' && !shiftKey) {
        const CValue = value.trim()
        let EValue =  ''
        if (CValue) { 
          if (!/(var|let|const)/.test(CValue)) {
            EValue = `print(${CValue})`
          }
          const body = acorn.parse((EValue || CValue), {ecmaVersion : 2020}).body
          jsInterpreter.interpret(body)
          const answer = jsInterpreter.getValue()
          console.log({answer})
          const finalValue = answer ? (CValue + '  ->   ' + answer) : CValue 
          setData(prevData => [...prevData, finalValue]);
          if (keyStorage[keyStorage.length - 1] !== CValue) {
            keyStorage.push(CValue)
            count = 0
          }
          setInputValue('')
        }
      } else if (key === 'ArrowUp' && keyStorage.length > 0 &&  keyStorage.length > count  && ++count && keyStorage[keyStorage.length - count]) {
        setInputValue(keyStorage[keyStorage.length - count])
      } else if (key === 'ArrowDown' && keyStorage.length > 0 && count > 0 && --count && keyStorage[keyStorage.length - count]) {
        setInputValue(keyStorage[keyStorage.length - count])
      }
    })
  }, []);

  const renderItems = (item, index) => (
    <div className="cs-item" key={`cs-item-${index}`}>
      <span>{'>'}</span>
      {item}
    </div>
  );

  return (
    <div className="cs--wrapper">
      <div className="cs--block">
        <div className="cs--content">
          {data.length > 0 && data.map(renderItems)}
        </div>
        <div className="cs--input-block">
          <span>{'>'}</span>
          <textarea ref={inputRef} value={inputValue} onChange={updateInput} /* onKeyDown={onEnter} */ className="cs--input" />
        </div>
      </div>
    </div>
  );
}
export default App
export { App }
