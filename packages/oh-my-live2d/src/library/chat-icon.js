(function attachChatIcon(windowObject) {
  const iconId = 'icon-chat';
  const svgMarkup =
    '<svg aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden"><symbol id="icon-chat" viewBox="0 0 1024 1024"><path d="M128 224c0-53 43-96 96-96h576c53 0 96 43 96 96v352c0 53-43 96-96 96H438.1L250.6 820.8c-17.1 13.4-42.6 1.2-42.6-20.6V672c-44.2-7.5-80-46-80-96V224zm160 96c-26.5 0-48 21.5-48 48s21.5 48 48 48h448c26.5 0 48-21.5 48-48s-21.5-48-48-48H288zm0 160c-26.5 0-48 21.5-48 48s21.5 48 48 48h288c26.5 0 48-21.5 48-48s-21.5-48-48-48H288z"></path></symbol></svg>';

  const inject = () => {
    if (document.getElementById(iconId)) {
      return;
    }

    const container = document.createElement('div');

    container.innerHTML = svgMarkup;

    const svg = container.firstChild;

    if (svg) {
      document.body.insertBefore(svg, document.body.firstChild);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject, { once: true });
  } else {
    inject();
  }
})(window);
