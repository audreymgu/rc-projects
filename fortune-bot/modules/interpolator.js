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
        console.log(intPoints);
        return bezier(intPoints, t);
    }
}

// console.log(bezier([ [0,0], [0,100], [100,100], [100,0] ], 0.5));