import * as puppeteer from 'puppeteer';
// import { exec } from 'child_process';

type ViewportDimensions = {
  width: number; height: number;
};

const MOBILE_USERAGENT =
    'Mozilla/5.0 (Linux; Android 8.0.0; Pixel 2 XL Build/OPD1.170816.004) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Mobile Safari/537.36';

/**
 * Wraps Puppeteer's interface to Headless Chrome to expose high level rendering
 * APIs that are able to handle web components and PWAs.
 */
export class Renderer {
  private browser_opts: {};
  private height_d = Number(process.env.HEIGHT || 1000);
  // private width_d = Number(process.env.WIDTH || 1000);
  private timeout_d = Number(process.env.TIMEOUT || 10000);

  constructor(browser: object) {
    this.browser_opts = browser;
  }

  async screenshot(
      url: string,
      isMobile: boolean,
      dimensions: ViewportDimensions,
      options?: object): Promise<Buffer> {

    const browser = await puppeteer.launch(this.browser_opts);
    // let proc = browser.process();
    // let pid = proc.pid;

    let buffer = null;

    const page = await browser.newPage();

    let height = dimensions.height || this.height_d;

    // let ppid = '';
    // exec(`pgrep -P ${pid}`, (error, stdout) => {
    //     // console.log(error, stdout, stderr);
    //     if (error)
    //         console.log(`Zygote Process Error: ${error}`);
    //     ppid = stdout.trim();
    //     // console.log('ppid', ppid);
    // });

    page.setViewport(
        {width: dimensions.width, height: height, isMobile});

    if (isMobile) {
      page.setUserAgent(MOBILE_USERAGENT);
    }

    let close = false;

    await page.goto(url, {timeout: this.timeout_d, waitUntil: 'networkidle0'})
        .catch((err) => {
            console.log(err);

            close = true;
        });

    // setTimeout(function() {
        // exec(`kill ${ppid}`);
        // proc.kill('SIGCHLD');
    // }, 100);

    if (!close) {
        if (!dimensions.height) {
            let pgLength = await page.evaluate('document.body.scrollHeight');

            page.setViewport({
                width: dimensions.width,
                height: pgLength,
                isMobile
            });
        }

        // Must be jpeg & binary format.
        const screenshotOptions =
            Object.assign({}, options, {type: 'jpeg', encoding: 'binary', fullpage: true});

        buffer = await page.screenshot(screenshotOptions);
    }

    await page.close();
    await browser.close();
    // proc.kill('SIGCHLD');
    // proc.kill('SIGKILL');

    // exec(`kill ${pid}`);

    if (buffer instanceof Buffer)
        return buffer;
    return Buffer.from('');

  }
}
