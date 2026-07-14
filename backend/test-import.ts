import('./src/controllers/PlanController.js')
  .then(mod => {
    console.log('✅ Módulo carregado!');
    console.log('Exportações:', Object.keys(mod));
    console.log('PlanController:', mod.PlanController);
    console.log('Métodos estáticos:', Object.getOwnPropertyNames(mod.PlanController || {}).filter(p => typeof mod.PlanController[p] === 'function'));
  })
  .catch(err => {
    console.error('❌ Erro:', err.message);
    console.error('Stack:', err.stack);
  });
