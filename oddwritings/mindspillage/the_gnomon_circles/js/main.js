// Compatible assets
const ASSET_EXTENSIONS = {
  DIV: 'txt',
  VIDEO: 'mp4',
  AUDIO: 'mp3',
  IMG: 'png',
}

// State
const state = {
  playing: false,
}

// UI
const ui = {
  renderCheckbox: (node) => {
    const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
    symbol.id = 'check';
    symbol.viewbox = '0 0 12 10';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('display', 'none');
    svg.appendChild(symbol);

    node.appendChild(svg);
  },

  createInput: (element) => {
    let input = document.createElement('input')
    input.setAttribute('class', 'checkbox-input')
    input.setAttribute('id', `checkbox-${element.id}`)
    input.setAttribute('type', 'checkbox');
    return input;
  },

  createLabel: (element, child) => {
    let label = document.createElement('label')
    label.setAttribute('class', 'checkbox')
    label.setAttribute('for', `checkbox-${element.id}`)
    label.appendChild(child);
    return label;
  },

  addCheckbox: (element, menu) => {
    let use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#check');

    let svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgContainer.setAttribute('width', '0.75rem');
    svgContainer.setAttribute('height', '0.75rem');
    svgContainer.appendChild(use);

    let span = document.createElement('span');
    span.appendChild(svgContainer);

    let label = ui.createLabel(element, span);
    let input = ui.createInput(element);

    menu.addEventListener('click', () => {
      utils.hideLayer(input, `${element.id}`);
      utils.muteLayer(input, `${element.id}`);
    });

    const media = document.getElementById(`${element.id}`);

    if (media.getAttribute('data-checked') === 'true') {
      input.click(); // check the box
      menu.checked = true;
      element.classList.add('show')
    } else {
      menu.checked = false;
      element.classList.add('hide')
    }

    menu.appendChild(input);
    menu.appendChild(label);
  },

  addPlayButton: (element) => {
    const PLAY_ICON = 'M0 0V14 l14 -7z';
    const STOP_ICON = 'M0 0h16v16H0z';
    let playButton = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    playButton.setAttribute('width', '1em');
    playButton.setAttribute('height', '1em');
    playButton.setAttribute('viewBox', '0 0 16 16');
    playButton.setAttribute('fill', 'currentColor');
    playButton.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    playButton.setAttribute('class', 'play-button');

    let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('id', `play-icon`);
    path.setAttribute('d', PLAY_ICON);
    playButton.appendChild(path);

    let label = document.createElement('label')
    label.setAttribute('class', 'checkbox')
    label.setAttribute('for', 'checkbox-media')
    label.appendChild(playButton);

    let input = document.createElement('input')
    input.setAttribute('class', 'checkbox-input')
    input.setAttribute('id', 'checkbox-media')
    input.setAttribute('type', 'checkbox');

    const videos = document.getElementsByTagName('video');
    const audios = document.getElementsByTagName('audio');

    label.addEventListener('mousedown', () => {
      playButton.classList.toggle('active')
      path.setAttribute('d', state.playing ? PLAY_ICON : STOP_ICON);
      utils.playPauseAllMedia(audios, videos)
    });

    element.appendChild(input);
    element.appendChild(label);
  },
}

// Media utilities
const utils = {
  addDefaultClassToElement: (element) => {
    if (element.tagName === 'VIDEO') {
      element.classList.add('video');
    }
    if (element.tagName === 'IMG') {
      element.classList.add('image');
    }
    if (element.tagName === 'DIV') {
      element.classList.add('text');
    }
  },

  addSrcToElement: (element, url) => {
    if (element.tagName === 'VIDEO' || element.tagName === 'AUDIO') {
      const source = document.createElement('source');
      source.src = url;
      if (element.tagName === 'VIDEO') {
          source.type = 'video/mp4';
          element.setAttribute('playsinline', 'playsinline')
      }
      if (element.tagName === 'AUDIO') {
          source.type = 'audio/mpeg';
      }
      element.appendChild(source)
    } else {
      element.src = url;
    }
  },

  addTextToElement: async (element, url) => {
    const text = await fetch(url)
        .then(res => res.text())
        .then(str => { return str });
    element.insertAdjacentText('beforeend', text);
  },

  hideLayer: (checkbox, id) => {
    const element = document.getElementById(id);
    const shouldShow = checkbox.checked;

    element.classList.toggle('show', shouldShow);
    element.classList.toggle('hide', !shouldShow);
  },

  muteLayer: (checkbox, id) => {
    const element = document.getElementById(id);
    element.muted = !checkbox.checked;
  },

  playPauseAllMedia: (audios, videos) => {
    if (state.playing) {
      for (let video of videos) {
        video.pause();
        video.currentTime = 0;
      }
      for (let audio of audios) {
        audio.pause();
        audio.currentTime = 0;
      }
      state.playing = false;
    } else {
      for (let video of videos) {
        video.play();
      }
      for (let audio of audios) {
        audio.play();
      }
      state.playing = true;
    }
  }
}

// Main loading function
const load = async () => {

  // prepare the UI elements
  const menu = document.getElementById('menu');
  ui.renderCheckbox(menu);

  if (document.getElementsByTagName('video').length > 0 || document.getElementsByTagName('audio').length > 0) {
    ui.addPlayButton(menu);
  }

  // prepare the layers
  const layers = document.getElementById('layers');
  const elements = layers.children;

  // add the default classes, src or text to the elements
  // add a checkbox for each element
  for (const element of elements) {
    utils.addDefaultClassToElement(element);

    const key = element.tagName;

    if (key === 'DIV') {
      await utils.addTextToElement(element, `./assets/${element.id}.${ASSET_EXTENSIONS[key]}`);
    } else {
      utils.addSrcToElement(element,`./assets/${element.id}.${ASSET_EXTENSIONS[key]}`);
    }

    ui.addCheckbox(element, menu);

    const index = Array.from(elements).indexOf(element);
    element.style.zIndex = ((elements.length - 1)- index).toString();
  }
}
