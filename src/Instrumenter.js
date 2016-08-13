import esprima from 'esprima';
import estraverse from 'estraverse';
import escodegen from 'escodegen';
import Chance from 'chance';

  const chance = new Chance();

  const defaults = {
    input: '',
    client: {
      startCode: (id) => `inst.start('${id}')`,
      endCode: (id) => `inst.end('${id}')`
    },
    escodegenOptions: {
      format: {
        indent: {
          style: '  '
        }
      }
    }
  };

  class Instrumenter {
    constructor(params) {
      params = Object.assign({}, defaults, params);

      this.input = params.input;
      this.client = params.client;
      this.escodegenOptions = params.escodegenOptions;

      this.ast = null;
      this.output = '';

      this.ast = esprima.parse(this.input);
    }

    instrument() {
      estraverse.traverse(this.ast, {
        enter: (node, parent) => {
          let id = chance.guid(),
              body = null;

          const clientStartAst = esprima.parse(
            typeof this.client.startCode === 'function' ?
              this.client.startCode(id) :
              this.client.startCode
          );

          const clientEndAst = esprima.parse(
            typeof this.client.endCode === 'function' ?
              this.client.endCode(id) :
              this.client.endCode
          );

          if (
            node.type === 'FunctionDeclaration' ||
            node.type === 'FunctionExpression'
          ) {
            body = node.body.body;

            if (!body) {
              throw new Error('No body found for function');
            }

            body.unshift(clientStartAst);

            if (
              body[body.length - 1].type !== 'ReturnStatement' &&
              body[body.length - 1].type !== 'ThrowStatement'
            ) {
              body.push(clientEndAst);
            }

            estraverse.traverse(node.body, {
              enter: (node, parent) => {
                var body = null;

                if (
                  node.type === 'FunctionDeclaration' ||
                  node.type === 'FunctionExpression'
                ) {
                  return estraverse.VisitorOption.Skip;
                }

                if (
                  node.type === 'ReturnStatement' ||
                  node.type === 'ThrowStatement'
                ) {
                  if (parent.type === 'BlockStatement') {
                    body = parent.body;
                  }
                  else if (parent.type === 'IfStatement') {
                    if (parent.consequent.type !== 'BlockStatement') {
                      parent.consequent = {
                        type: 'BlockStatement',
                        body: [parent.consequent]
                      };
                    }

                    body = parent.consequent.body;
                  }
                  else if (parent.type === 'SwitchCase') {
                    body = parent.consequent;
                  }

                  if (!body) {
                    throw new Error('No body found for return statement parent');
                  }
                  
                  for (var l = body.length, i = l - 1; i >= 0; i--) {
                    if (
                      body[i].type === 'ReturnStatement' ||
                      body[i].type === 'ThrowStatement'
                    ) {
                      body.splice(i, 0, clientEndAst);
                    }
                  }
                }
              }
            });
          }
        }
      });

      return escodegen.generate(this.ast, this.escodegenOptions);
    }
  }

export default Instrumenter;
