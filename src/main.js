import { initScene } from './scene.js';
import { loadData } from './loader.js';
import { enableEditor } from './editor.js';
import { initGUI } from './gui.js';
import { initExporter } from './exporter.js';

loadData().then(data => {
  const scene = initScene(data);
  const editor = enableEditor(scene, data);
  initGUI(scene, data, editor);
  initExporter(data);
});
