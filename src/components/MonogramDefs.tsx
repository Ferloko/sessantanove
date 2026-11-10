/** Monograma de la casa como <pattern> SVG (id "sn-mono") para estampar las ilustraciones. Generado a partir de public/monogram.svg. */
export function MonogramDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
    <path id="star" fillRule="evenodd" d="M0.0 -29.0 L5.7 -13.9 L15.6 -15.6 L13.9 -5.7 L29.0 0.0 L13.9 5.7 L15.6 15.6 L5.7 13.9 L0.0 29.0 L-5.7 13.9 L-15.6 15.6 L-13.9 5.7 L-29.0 0.0 L-13.9 -5.7 L-15.6 -15.6 L-5.7 -13.9Z M10 0 A10 10 0 1 0 -10 0 A10 10 0 1 0 10 0Z"/>
    <g id="diamond">
      <path d="M-26 -7 L-16 -18 H-8 L-11 -7Z M-8 -7 L-5 -18 H5 L8 -7Z M26 -7 L16 -18 H8 L11 -7Z"/>
      <path d="M-26 -4 H-11 L-2 20Z M-8 -4 H8 L0 22Z M26 -4 H11 L2 20Z"/>
    </g>
    <g id="knuckles">
      <g fill="none" stroke="#b99a62" strokeWidth="3.6">
        <ellipse cx="-19" cy="-3" rx="6.6" ry="8"/><ellipse cx="-6.5" cy="-10" rx="6.6" ry="8"/>
        <ellipse cx="6.5" cy="-10" rx="6.6" ry="8"/><ellipse cx="19" cy="-3" rx="6.6" ry="8"/>
        <path d="M-21 5 Q0 15 21 5" strokeLinecap="round"/>
      </g>
      <path d="M-18 17 Q0 9 18 17 Q0 24 -18 17Z"/>
    </g>
    <g id="sn" transform="scale(0.94)">
      <path d="M-20.5 -24 H-15.5 L20.5 24 H15.5Z"/>
      <path d="M-20.5 -24 H-17.3 V24 H-20.5Z M17.3 -24 H20.5 V24 H17.3Z"/>
      <path d="M-27 10 H-11 V12.4 H-27Z M11 -12.4 H27 V-10 H11Z M-24 -24 H-15 V-22 H-24Z M15 22 H24 V24 H15Z M-24 22 H-14 V24 H-24Z M14 -24 H24 V-22 H14Z"/>
      <path fill="none" stroke="#b99a62" strokeWidth="5.4" d="M10.5 -14 C8 -27 -10.5 -26 -10.5 -13 C-10.5 0 11 -1 11 13 C11 26 -8.5 27 -11 13"/>
    </g>
  
        <pattern id="sn-mono" width="46" height="46" patternUnits="userSpaceOnUse" viewBox="0 0 200 200">
          <g fill="#b99a62"><use href="#sn" x="100" y="100"/><use href="#sn"/><use href="#sn" x="200"/><use href="#sn" y="200"/><use href="#sn" x="200" y="200"/><use href="#star" x="100"/><use href="#star" x="100" y="200"/><use href="#star" y="100"/><use href="#star" x="200" y="100"/><use href="#diamond" x="50" y="50"/><use href="#diamond" x="150" y="150"/><use href="#knuckles" x="150" y="50"/><use href="#knuckles" x="50" y="150"/></g>
        </pattern>
      </defs>
    </svg>
  );
}
