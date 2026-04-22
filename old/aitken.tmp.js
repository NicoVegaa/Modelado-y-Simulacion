
      const canvas = document.getElementById("plot");
      const ctx = canvas.getContext("2d");

      const ejemplo = document.getElementById("ejemplo");
      const gxInput = document.getElementById("gx");
      const x0Input = document.getElementById("x0");
      const tolInput = document.getElementById("tol");
      const maxIterInput = document.getElementById("maxIter");
      const speedInput = document.getElementById("speed");
      const tbody = document.getElementById("tbody");

      const startBtn = document.getElementById("start");
      const stopBtn = document.getElementById("stop");
      const stepBtn = document.getElementById("step");
      const expandBtn = document.getElementById("expand");
      const resetBtn = document.getElementById("reset");

      let timer = null;
      let iter = 0;
      let x = 0;
      let seq = [];
      let acc = [];
      let cfg = null;

      function setEjemplo() {
        if (ejemplo.value === "cos") {
          gxInput.value = "Math.cos(x)";
          x0Input.value = "0.5";
        } else if (ejemplo.value === "x2") {
          gxInput.value = "Math.pow(x + 2, 1/3)";
          x0Input.value = "1";
        }
      }

      ejemplo.addEventListener("change", () => {
        if (ejemplo.value !== "custom") setEjemplo();
      });

      function parseFunction(expr) {
        return new Function("x", `return ${expr};`);
      }

      function resetState() {
        iter = 0;
        tbody.innerHTML = "";
        seq = [];
        acc = [];
        x = parseFloat(x0Input.value);
      }

      function computeConfig() {
        const g = parseFunction(gxInput.value);
        const tol = parseFloat(tolInput.value);
        const maxIter = parseInt(maxIterInput.value, 10);
        const speed = parseInt(speedInput.value, 10);

        return { g, tol, maxIter, speed };
      }

      function getRange() {
        const xs = [...seq, ...acc].filter((v) => Number.isFinite(v));
        if (xs.length === 0) return { min: -1, max: 1 };
        const min = Math.min(...xs) - 0.5;
        const max = Math.max(...xs) + 0.5;
        return { min, max };
      }

      function drawAxes() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#0b192c";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "#1e3352";
        ctx.lineWidth = 1;

        for (let i = 0; i <= 10; i++) {
          const t = i / 10;
          const y = t * canvas.height;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
        for (let i = 0; i <= 10; i++) {
          const t = i / 10;
          const xg = t * canvas.width;
          ctx.beginPath();
          ctx.moveTo(xg, 0);
          ctx.lineTo(xg, canvas.height);
          ctx.stroke();
        }
      }

      function mapX(i, maxN) {
        if (maxN <= 0) return 0;
        return (i / maxN) * canvas.width;
      }

      function mapY(y, min, max) {
        return canvas.height - ((y - min) / (max - min)) * canvas.height;
      }

      function drawSeries(values, color, min, max) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const maxN = Math.max(values.length - 1, 1);
        values.forEach((v, i) => {
          if (!Number.isFinite(v)) return;
          const px = mapX(i, maxN);
          const py = mapY(v, min, max);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();

        values.forEach((v, i) => {
          if (!Number.isFinite(v)) return;
          const px = mapX(i, maxN);
          const py = mapY(v, min, max);
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      function render() {
        const { min, max } = getRange();
        drawAxes();
        if (seq.length > 0) drawSeries(seq, "#4cc9f0", min, max);
        if (acc.length > 0) drawSeries(acc, "#ffb703", min, max);
      }

      function step() {
        if (!cfg) return;
        const { g, tol, maxIter } = cfg;

        const x0 = x;
        const x1 = g(x0);
        const x2 = g(x1);
        const denom = x2 - 2 * x1 + x0;
        let xhat = NaN;
        if (Math.abs(denom) > 1e-12) {
          xhat = x0 - Math.pow(x1 - x0, 2) / denom;
        }
        const err = Number.isFinite(xhat) ? Math.abs(xhat - x2) : Math.abs(x2 - x1);

        iter += 1;
        seq.push(x0);
        acc.push(xhat);

        const row = document.createElement("tr");
        row.innerHTML = `<td>${iter}</td><td>${x0.toFixed(6)}</td><td>${x1.toFixed(
          6
        )}</td><td>${x2.toFixed(6)}</td><td>${
          Number.isFinite(xhat) ? xhat.toFixed(6) : "-"
        }</td><td>${err.toExponential(3)}</td>`;
        tbody.appendChild(row);

        render();

        if (err < tol || iter >= maxIter) {
          stop();
        } else {
          x = Number.isFinite(xhat) ? xhat : x1;
        }
      }

      function start() {
        cfg = computeConfig();
        if (!timer) {
          timer = setInterval(step, cfg.speed);
        }
      }

      function stop() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }

      function stepOnce() {
        stop();
        if (!cfg) cfg = computeConfig();
        step();
      }

      function resetAll() {
        stop();
        resetState();
        cfg = computeConfig();
        render();
      }

      function openTableWindow() {
        const w = window.open("", "_blank");
        if (!w) return;
        const doc = w.document;
        doc.open();
        doc.write(
          "<!doctype html><html lang=\"es\"><head><meta charset=\"utf-8\">" +
            "<title>Tabla Aitken</title></head><body></body></html>"
        );
        doc.close();

        const style = doc.createElement("style");
        style.textContent =
          "body { font-family: \"Trebuchet MS\", \"Segoe UI\", Tahoma, sans-serif; padding: 16px; }" +
          "h1 { margin: 0 0 12px 0; }" +
          "table { width: 100%; border-collapse: collapse; font-size: 13px; }" +
          "th, td { padding: 8px 10px; border-bottom: 1px solid #ddd; text-align: right; }" +
          "th { text-align: left; background: #f2f2f2; position: sticky; top: 0; }";
        doc.head.appendChild(style);

        const h1 = doc.createElement("h1");
        h1.textContent = "Tabla de valores - Aitken";
        doc.body.appendChild(h1);

        const table = doc.createElement("table");
        const thead = doc.createElement("thead");
        thead.innerHTML = document.querySelector("thead").innerHTML;
        const tbodyCopy = doc.createElement("tbody");
        tbodyCopy.innerHTML = tbody.innerHTML;
        table.appendChild(thead);
        table.appendChild(tbodyCopy);
        doc.body.appendChild(table);
      }

      startBtn.addEventListener("click", start);
      stopBtn.addEventListener("click", stop);
      stepBtn.addEventListener("click", stepOnce);
      expandBtn.addEventListener("click", openTableWindow);
      resetBtn.addEventListener("click", resetAll);

      setEjemplo();
      resetAll();
    
