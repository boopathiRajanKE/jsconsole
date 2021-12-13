
export class Interpreter {
    constructor(visitor) {
        this.visitor = visitor
    }
    interpret(nodes) {
        return this.visitor.run(nodes)
    }
    getValue() {
        setTimeout(()=> {
            this.visitor.clearValue()
        }, 0)
        return this.visitor.value
    }
}