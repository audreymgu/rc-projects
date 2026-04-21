function interp(a,b,t) {
    return a + (b - a) * t;
};

function lerp([ax, ay], [bx, by], t) {
    const x = interp(ax, bx, t);
    const y = interp(ay, by, t);
    return [x, y];
}

function bezier(points, t) {
    if (points.length == 1) {
        return points[0];
    } else {
        let intPoints = [];
        for (let i = 0; i < (points.length - 1); i++) {
            const newPoint = lerp(points[i], points[i + 1], t);
            intPoints.push(newPoint);
        }
        return bezier(intPoints, t);
    }
}

export function curveInterpolator(points, interval) {
    // this implementation captures the end point of each curve, while skipping the start point, per spec.
    const increment = 1 / interval;
    const pointArr = [];
    for (let i = 1; i <= interval; i++) {
        let coords = bezier(points, i * increment);
        coords = coords.map((point) => {
            return Math.round(point);
        })
        pointArr.push(coords);
    }
    return pointArr;
}

// testing
// console.log(curveInterpolator([ [18,38], [19,42], [21,45], [25,45] ], 3));