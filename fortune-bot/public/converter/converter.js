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
        
        // import SVG as DOM object
        const doc = parser.parseFromString(text, 'image/svg+xml');

        // doc.children[0] is the SVG element
        const pathDOM = doc.children[0].querySelectorAll("path");
        const paths = [];
        let pathSegments = [];

        // get name
        const name = doc.children[0].getAttribute("id");

        console.log(name);

        // get rendering parameters
        const params = [parseFloat(doc.children[0].getAttribute("width")), parseFloat(doc.children[0].getAttribute("height"))];

        // get paths
        for (path of pathDOM) {
            const string = path.getAttribute("d");
            paths.push(string);
        }

        // break into segments
        for (i in paths) {
            const segments = paths[i].match(/[MSsCc][^MSsCc]*/g);
            pathSegments = segments;
        }

        // clean and separate point data
        pathSegments = pathSegments.map((segment) => {
            // add commas back, then split by comma
            return segment.replaceAll(/[MSsCc]/g, "$&,").replaceAll(/-/g, ",-").split(/,+/);
        });

        const shape = {
            name,
            params,
            pathSegments
        };

        // console.log(shape);
        // console.log(params);
        // console.log(pathSegments);
        console.log(shape);
        // debugger;

        const response = await getResponse('/shape', shape);
        checkResponse(response);
    }
};

async function getResponse(type, data) {
    const response = await fetch( type, { 
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data }),
    });
    return response;
}

async function checkResponse(response) {
    if (response.ok) {
        console.log("shape sent to server");
    } else {
        console.log("error");
        console.log(response);
    }
}