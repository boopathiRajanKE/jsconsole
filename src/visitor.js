import { always, cond, equals } from 'ramda';

const l = console.log
const ops = {
    ADD: '+',
    SUB: '-',
    MUL: '*',
    DIV: '/'
}
let globalScope = new Map()
export class Visitor {
    constructor () {
        this.value = ''
    }
    visitVariableDeclaration(node) {
        const nodeKind = node.kind
        return this.visitNodes(node.declarations, nodeKind)
    }
    visitVariableDeclarator(node, nodeKind) {
        const init = this.visitNode(node.init)
        const id = node.id && node.id.name 
        if (nodeKind === 'let' || nodeKind === 'const') {
            if (globalScope.has(`var-${id}`) || globalScope.has(`let-${id}`) || globalScope.has(`const-${id}`)) {
                this.value = `Uncaught SyntaxError: Identifier '${id}' has already been declared`
            } else {
                globalScope.set(`${nodeKind}-${id}`, init)
                this.value = init
            }
        } else {
            globalScope.set(`${nodeKind}-${id}`, init)
            this.value = init
        }
    }
    visitIdentifier(node, isValidator = false) {
        const name = node.name
        console.log(name)
        if (globalScope.get(`var-${name}`))
            return globalScope.get(`var-${name}`)
        else if (globalScope.get(`let-${name}`))
            return globalScope.get(`let-${name}`)
        else if (globalScope.get(`const-${name}`))
            return globalScope.get(`const-${name}`)
        else
            return !isValidator ? name : `Uncaught ReferenceError: ${name} is not defined`
    }
    visitLiteral(node) {
        return node.raw
    }
    visitBinaryExpression(node) {
        const leftNode = isNaN(this.visitNode(node.left)) ? this.visitNode(node.left) : +this.visitNode(node.left)
        const operator = node.operator
        const rightNode = isNaN(this.visitNode(node.right)) ? this.visitNode(node.right) : +this.visitNode(node.right) 
        var result =  cond([
            [equals(ops.ADD), always(leftNode + rightNode)],
            [equals(ops.SUB), always(leftNode - rightNode)],
            [equals(ops.DIV), always(leftNode / rightNode)],
            [equals(ops.MUL), always(leftNode * rightNode)]
        ]);
        return  result(operator);
    }
    evalArgs(nodeArgs = []) {
        let g = []
        for (const nodeArg of nodeArgs) {
            g.push(this.visitNode(nodeArg, '', true))
        }
        return g
    }
    visitCallExpression(node) {
        const callee = this.visitIdentifier(node.callee || node)
        const _arguments = this.evalArgs(node.arguments)
        
        if (callee === "print")
            this.value = _arguments[0]
        else 
            this.value = callee
    }
    visitNodes(nodes, nodeKind) {
        for (const node of nodes) {
            this.visitNode(node, nodeKind)
        }
    }
    visitExpressionStatement (node) {
        return this.visitCallExpression(node.expression)
    }
    visitNode(node, nodeKind, isValidator) {
        switch (node.type) {
            case 'VariableDeclaration':
                return this.visitVariableDeclaration(node)
            case 'VariableDeclarator':
                return this.visitVariableDeclarator(node, nodeKind)
            case 'Literal':
                return this.visitLiteral(node)
            case 'Identifier':
                return this.visitIdentifier(node, isValidator)
            case 'BinaryExpression':
                return this.visitBinaryExpression(node)
            case "CallExpression":
                return this.visitCallExpression(node)
            case "ExpressionStatement":
                return this.visitExpressionStatement(node)
            default:
        }
    }
    run(nodes) {
        console.log("nodes")
        console.log(nodes)
        return this.visitNodes(nodes)
    }
    clearValue () {
        this.value = ''
    }
}