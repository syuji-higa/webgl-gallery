/**
 * webgl color
 */

/**
 * @param {number} h - int[0-360]
 * @param {number} s - [0-1]
 * @param {number} v - [0-1]
 * @param {number} a - [0-1]
 * @return {Array<number>}
 */
export const hsva = (h, s, v, a) => {
	if(s > 1 || v > 1 || a > 1) return;
	const th = h % 360;
	const i  = Math.floor(th / 60);
	const f  = th / 60 - i;
	const m  = v * (1 - s);
	const n  = v * (1 - s * f);
	const k  = v * (1 - s * (1 - f));
	const color = new Array();
	if(!s > 0 && !s < 0) {
		color.push(v, v, v, a);
	} else {
		const r = new Array(v, n, m, m, k, v);
		const g = new Array(k, v, v, n, m, m);
		const b = new Array(m, m, k, v, v, n);
		color.push(r[i], g[i], b[i], a);
	}
	return color;
};
