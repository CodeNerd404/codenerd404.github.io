// Batch watermark script (fallback). Tries to use window.watermarkTool.apply if available; otherwise uses browser Canvas.
(function(){
  const fileInput = document.getElementById('fileInput');
  const preview = document.getElementById('previewArea');
  const applyBtn = document.getElementById('applyBtn');

  let loadedFiles = [];
  fileInput.addEventListener('change', e => {
    loadedFiles = Array.from(e.target.files || []);
    preview.innerHTML = '';
    if (loadedFiles.length === 0) {
      preview.textContent = '预览区（加载图片）';
      return;
    }
    // show first image as preview
    const first = loadedFiles[0];
    const url = URL.createObjectURL(first);
    const img = new Image();
    img.onload = () => {
      preview.innerHTML = '';
      img.style.maxWidth = '100%';
      img.style.maxHeight = '100%';
      preview.appendChild(img);
    };
    img.src = url;
  });

  function loadImageFromFile(file){
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function addWatermarkCanvas(img, text, opacity, position){
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    ctx.drawImage(img, 0, 0);

    ctx.globalAlpha = opacity;
    // choose font size relative to image
    const fontSize = Math.max(20, Math.floor(Math.min(canvas.width, canvas.height) / 20));
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // text color + stroke for readability
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = Math.max(2, Math.floor(fontSize/8));

    let x = canvas.width / 2;
    let y = canvas.height - fontSize - 20;
    if (position === 'top-left') { x = fontSize + 20; y = fontSize + 20; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; }
    else if (position === 'center') { x = canvas.width/2; y = canvas.height/2; }
    else { // bottom-right
      x = canvas.width - 20; y = canvas.height - 20; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
    }

    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
    ctx.globalAlpha = 1;
    return canvas;
  }

  function downloadDataUrl(dataUrl, filename){
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  applyBtn.addEventListener('click', async () => {
    if (!loadedFiles || loadedFiles.length === 0) { alert('请先选择图片'); return; }
    const text = document.getElementById('wmText').value || '';
    const opacity = parseFloat(document.getElementById('wmOpacity').value) || 0.6;
    const position = document.getElementById('wmPosition').value || 'bottom-right';

    // If external watermarkTool exists and exposes apply(file|img, options) -> Blob|dataURL
    const external = window.watermarkTool && typeof window.watermarkTool.apply === 'function';

    for (let file of loadedFiles) {
      try {
        if (external) {
          // try calling external API with File
          try {
            const res = await window.watermarkTool.apply(file, { text, opacity, position });
            if (res instanceof Blob) {
              const url = URL.createObjectURL(res);
              downloadDataUrl(url, file.name.replace(/\.[^/.]+$/, '') + '_watermark.png');
              URL.revokeObjectURL(url);
              continue;
            } else if (typeof res === 'string') {
              // assume dataURL
              downloadDataUrl(res, file.name.replace(/\.[^/.]+$/, '') + '_watermark.png');
              continue;
            }
            // otherwise fallthrough to canvas
          } catch (e) {
            console.warn('调用外部 watermarkTool 出错，回退到内置实现', e);
          }
        }

        const img = await loadImageFromFile(file);
        const canvas = addWatermarkCanvas(img, text, opacity, position);
        const dataUrl = canvas.toDataURL('image/png');
        downloadDataUrl(dataUrl, file.name.replace(/\.[^/.]+$/, '') + '_watermark.png');
      } catch (err) {
        console.error('处理文件失败', file.name, err);
      }
    }
    alert('处理完成（文件已自动下载）');
  });

  // expose a fallback api if someone wants to call it programmatically
  window.watermarkToolFallback = {
    applyFromFile: async function(file, options){
      const img = await loadImageFromFile(file);
      const canvas = addWatermarkCanvas(img, options.text||'', options.opacity||0.6, options.position||'bottom-right');
      return new Promise((resolve) => canvas.toBlob(b => resolve(b), 'image/png'));
    }
  };
})();
