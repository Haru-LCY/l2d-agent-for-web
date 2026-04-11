import { loadOml2d } from '../dist/index.js';

const oml2d = loadOml2d({
  models: [
    {
      path: 'https://model.hacxy.cn/HK416-1-normal/model.json',
      showHitAreaFrames: true,
      position: [0, 60],
      scale: 0.08,
      stageStyle: {
        height: 450
      }
    },
    {
      path: 'https://model.hacxy.cn/Pio/model.json',
      scale: 0.4,
      position: [0, 50],
      stageStyle: {
        height: 300
      }
    }
  ],
  tips: {
    idleTips: {
      wordTheDay: true
    }
  }
});

oml2d.onStageSlideIn(() => {
  oml2d.tipsMessage('模型加载成功！', 2000, 10);
});

// oml2d.onStageSlideIn(() => {
//   oml2d.loadNextModel();
// });

// oml2d.onStageSlideOut(() => {
//   console.log('ssssssssss');
// });
