import Metalsmith from 'metalsmith';
import async from 'async';
import handlebars from 'handlebars';

export const HANDLERBAR_MATCH = /{{([^{}]+)}}/;
export const HANDLERBAR_MATCH_FOLDER_BEFORE = {
    regex: /\\{{/,
    split: '',
    join: '\\\\{{',
};
export const HANDLERBAR_MATCH_FOLDER_AFTER = {
    regex: /\\\\{{/,
    join: '\\{{',
};

handlebars.registerHelper('captialize', (name = '') => {
    if (name.length === 0) return name;
    return `${name[0].toUpperCase()}${name.substr(1).toLowerCase()}`;
});

handlebars.registerHelper('deleteIfNotEmpty', (name = '') => {
    if (name == undefined || name.length === 0) return 'deleteIfNotEmpty';
    return name;
});

interface AsyncSeriesCallback {
    callback: async.AsyncResultArrayCallback<unknown, string | Error>;
    files: Metalsmith.Files;
    fileName: string;
    metadata: object;
}

interface AsyncSeriesHandlebarCallback extends AsyncSeriesCallback {
    fileContent?: string;
    err: Error | undefined;
    res: string;
}

export const fileContentInterpolationHandlebar = ({
    err,
    callback,
    fileName,
    res,
    files,
}: AsyncSeriesHandlebarCallback) => {
    // if any error while templating, return
    if (err) return callback(err);

    const selectedFile = files[fileName];

    // check if file if not null
    if (selectedFile == undefined)
        return callback(`File: ${fileName} not found`);

    // replace file name
    selectedFile.contents = Buffer.from(res);
    callback();
};

export const fileContentInterpolation = ({
    callback,
    fileName,
    metadata,
    files,
}: AsyncSeriesCallback) => {
    const fileContent = files[fileName]?.contents.toString();

    // return if file doesnt have to templated
    if (fileContent == undefined || !HANDLERBAR_MATCH.test(fileContent))
        return callback();

    // use handlerbars to generate named file content
    handlerbarsRender(fileContent, metadata, (err, res) =>
        fileContentInterpolationHandlebar({
            callback,
            err,
            fileContent,
            fileName,
            files,
            metadata,
            res,
        }),
    );
};

export const fileNameInterpolationHandlebar = ({
    err,
    callback,
    fileName,
    res,
    files,
}: AsyncSeriesHandlebarCallback) => {
    // if any error while templating, return
    if (err) return callback(err);

    // restore nested directory name
    if (HANDLERBAR_MATCH_FOLDER_AFTER.regex.test(fileName))
        fileName = fileName
            .split(HANDLERBAR_MATCH_FOLDER_AFTER.regex)
            .join(HANDLERBAR_MATCH_FOLDER_AFTER.join);

    // delete file is fileName not parsed
    if (res == undefined || res == '' || res.includes('deleteIfNotEmpty'))
        if (HANDLERBAR_MATCH.test(fileName)) {
            delete files[fileName];
            return callback();
        }

    // check if file naming was unsuccessfull
    // check if file with same name already exists
    if (res === fileName || files[res]) return callback();

    // no error found! continue
    const fileData = files[fileName];
    if (fileData !== undefined) files[res] = fileData;

    // delete the existing template file
    delete files[fileName];
    callback();
};

export const fileNameInterpolation = ({
    callback,
    fileName,
    metadata,
    files,
}: AsyncSeriesCallback) => {
    if (!HANDLERBAR_MATCH.test(fileName)) return callback();

    // creating nested folder
    if (HANDLERBAR_MATCH_FOLDER_BEFORE.regex.test(fileName))
        fileName = fileName
            .split(HANDLERBAR_MATCH_FOLDER_BEFORE.regex)
            .join(HANDLERBAR_MATCH_FOLDER_BEFORE.join);

    // use handlerbars to generate named file name
    handlerbarsRender(fileName, metadata, (err, res) =>
        fileNameInterpolationHandlebar({
            callback,
            err,
            fileName,
            files,
            metadata,
            res,
        }),
    );
};

export const renderTemplate: Metalsmith.Plugin = (files, metalSmith, done) => {
    const metadata = metalSmith.metadata();

    async.each(
        Object.keys(files),
        (fileName, next) => {
            async.series(
                [
                    /** Series Loop 1 */
                    /** Prepare the interpolation for file contents. */
                    (callback) =>
                        fileContentInterpolation({
                            callback,
                            fileName,
                            files,
                            metadata,
                        }),
                    /** Series Loop 2 */
                    /** Prepare the interpolation for file name. */
                    (callback) =>
                        fileNameInterpolation({
                            callback,
                            fileName,
                            files,
                            metadata,
                        }),
                ],
                (err: string | Error | null | undefined) => {
                    if (err && typeof err != 'string') return done(err);
                    if (err) return done(new Error(err));
                    next();
                },
            );
        },
        (err) => {
            if (err == null) err = undefined;
            done(err);
        },
    );
};

export const generateWithMetalsmith = async ({
    metadata = {},
    destination = '',
    source = '',
}: MetalsmithScaffold) => {
    return new Promise((resolve, reject) => {
        const metalsmith = Metalsmith(destination);
        Object.assign(metadata, {
            packageJSON: 'package.json',
            xsAppJson: 'xs-app.json',
        });
        Object.assign(metalsmith.metadata(), metadata);

        metalsmith
            // set clean
            .clean(false)
            // set source template
            .source(source)
            // set destination scaffold url
            .destination(destination)
            // set plugins
            .use(renderTemplate)
            //build
            .build((err) => {
                if (err) {
                    console.log(err);
                    return reject(err);
                }
                resolve(true);
            });
    });
};

export interface MetalsmithScaffold {
    metadata: object;
    source: string;
    destination: string;
}

export const scaffoldModulesUsingMS = async (
    name: string,
    data?: MetalsmithScaffold,
): Promise<boolean> => {
    if (data == undefined)
        throw new Error(`${name} data is undefind while scaffold`);
    await generateWithMetalsmith({
        metadata: data.metadata,
        destination: data.destination,
        source: data.source,
    });
    return Promise.resolve(true);
};

export const handlerbarsRender = (
    fileName = '',
    metadata: object,
    cb: (err: Error | undefined, res: string) => void,
) => {
    try {
        const template = handlebars.compile(fileName);
        const result = template(metadata);
        cb(undefined, result);
    } catch (error: unknown) {
        if (error instanceof Error) return cb(error, '');
        cb(new Error('Error while templating'), '');
    }
};
