let mouseArray = [];
let lastX = window.screenX;
let lastY = window.screenY;
let macroDetected = false; // 매크로 탐지 상태를 추적하는 변수

document.addEventListener("mousemove", (event) => {
    const x = event.clientX;
    const y = event.clientY;

    // x 또는 y 좌표가 1 이상 이동했을 때만 배열에 저장
    if (x !== lastX || y !== lastY) {
        lastX = x;
        lastY = y;
        mouseArray.push({ x, y });
    }
});

const getCurvature = (x, y) => {
    if (x.length > 2 && y.length > 2) {
        // Function to estimate derivatives using central difference method
        const derivative = (arr) => {
            const dx = new Array(arr.length).fill(0);
            for (let i = 1; i < arr.length - 1; i++) {
                dx[i] = (arr[i + 1] - arr[i - 1]) / 2; // Central difference
            }
            dx[0] = arr[1] - arr[0]; // Forward difference for the first element
            dx[arr.length - 1] = arr[arr.length - 1] - arr[arr.length - 2]; // Backward difference for the last element
            return dx;
        };

        // First and second derivatives
        const x_prime = derivative(x);
        const y_prime = derivative(y);
        const x_double_prime = derivative(x_prime);
        const y_double_prime = derivative(y_prime);

        // Calculating curvature for each point
        const validIndices = x_prime.map((val, idx) => val !== 0 || y_prime[idx] !== 0);
        const curvature = validIndices.map((isValid, idx) => {
            if (isValid) {
                return Math.abs(x_prime[idx] * y_double_prime[idx] - y_prime[idx] * x_double_prime[idx]) /
                    Math.pow(x_prime[idx] ** 2 + y_prime[idx] ** 2, 1.5);
            } else {
                return null;
            }
        }).filter(val => val !== null);

        if (curvature.length > 0) {
            const meanCurvature = curvature.reduce((a, b) => a + b, 0) / curvature.length;
            const maxCurvature = Math.max(...curvature);
            const minCurvature = Math.min(...curvature);
            const stdCurvature = Math.sqrt(curvature.reduce((a, b) => a + Math.pow(b - meanCurvature, 2), 0) / curvature.length);

            const isMacro = maxCurvature <= 0.01;

            return {
                isMacro: isMacro,
                values: {
                    MeanCurvature: meanCurvature.toFixed(10),
                    MaxCurvature: maxCurvature.toFixed(10),
                    MinCurvature: minCurvature.toFixed(10),
                    CurvatureStd: stdCurvature.toFixed(10)
                }
            };
        } else {
            return {
                isMacro: true,
                values: {
                    MeanCurvature: null,
                    MaxCurvature: null,
                    MinCurvature: null,
                    CurvatureStd: null
                }
            };
        }
    } else {
        return {
            isMacro: true,
            values: {
                MeanCurvature: null,
                MaxCurvature: null,
                MinCurvature: null,
                CurvatureStd: null
            }
        };
    }
}

const process = async () => {
    const xCoords = mouseArray.map((point) => point.x);
    const yCoords = mouseArray.map((point) => point.y);

    const result = getCurvature(xCoords, yCoords)

    console.log("Mean Curvature:", result.values.MeanCurvature);
    console.log("Max Curvature:", result.values.MaxCurvature);
    console.log("Min Curvature:", result.values.MinCurvature);
    console.log("Curvature Std:", result.values.CurvatureStd);
    console.log("isMacro:", result.isMacro);

    if (result.isMacro) {
        macroDetected = true;
    }

    mouseArray = [];
}

const initMacroDetector = async (targetId) => {
    const target = document.getElementById(targetId);

    target.addEventListener("click", async () => {
        await process();

        if (macroDetected) {
            alert("다시 시도해 주십시오.");
        }

        macroDetected = false;
    });


    document.addEventListener("click", async () => {
        mouseArray = [];
    });
}

export { initMacroDetector };
