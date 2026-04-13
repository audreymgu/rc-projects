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
    // note that iterating this way means that the last point (end point) is not sampled. since commands are chained together continuously, starting from where the last one ended, this is actually desired behavior.
    const increment = 1 / interval;
    const pointArr = [];
    for (let i = 0; i < interval; i++) {
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