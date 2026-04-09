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

window.addEventListener("DOMContentLoaded", () => {
    let upload = document.getElementById("svgInput");
    upload.addEventListener('change', ingestFiles);
});

async function ingestFiles() {
    for (file of this.files) {
        const text = await file.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'image/svg+xml');

        // const propArray = text.match(/viewBox=".*?"/);
        // let pathArray = text.match(/<path[\s\S]*\/>/g);

        // for (path of pathArray) {
        //     const path = path.replaceAll(/\n|\t/g, "");
        // }
        // console.log(propArray);
        // console.log(pathArray);
    
        const pathDOM = doc.children[0].querySelectorAll("path");
        const paths = [];
        let pathSegments = [];

        // get paths
        for (path of pathDOM) {
            const string = path.getAttribute("d");
            paths.push(string);
        }

        // pathArray.map((path) => {
        //     return path.replaceAll(/ /g, "");
        // })

        // break into segments
        for (i in paths) {
            const segments = paths[i].match(/[MSsCc](\d.|\.|,|-)+/g);
            pathSegments = segments;
        }

        pathSegments = pathSegments.map((segment) => {
            // add commas back, then split by comma
            return segment.replaceAll(/[MSsCc]/g, "$&,").replaceAll(/-/g, ",-").split(/,+/);
        });

        console.log(pathSegments);

        // debugger;
    }
};