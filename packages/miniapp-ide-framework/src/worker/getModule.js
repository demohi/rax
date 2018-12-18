import { registerPage } from './pageHub';
import { createErrorPage } from './errorPage';
/**
 * Compatible `require` function for worker.
 *   support
 *     "@core/app": { register: applyFactory },
 *     "@core/page": { register: registerPage },
 */
export default function getModule(modName) {

  switch (modName) {
    case '@core/app':
      return {
        register(desc, factory) {
          applyFactory(factory);
        }
      };
    case '@core/page':
      return {
        register: registerPage,
      };
  }

  warn('Require Unknown mod,', modName);
}

// todo refactor
function applyFactory(factory, context = {}) {
  const module = { exports: null };
  factory(module, module.exports, function(mod) {
    if (mod === '@core/context') {
      return context;
    } else {
      return require.call(context, mod);
    }
  });
  const component = interopRequire(module.exports);
  return (null === component && context.rax) ? createErrorPage({
    require,
    createElement: context.rax.createElement,
    message: '找不到页面'
  }) : component;
}

function interopRequire(mod) {
  return mod && mod.default ? mod.default : mod;
}

