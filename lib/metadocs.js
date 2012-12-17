var path = require('path'),
    fs = require('fs'),
    existsSync = fs.existsSync || path.existsSync,
    Showdown = require('./showdown'),
    converter = new Showdown.converter(),
    tpl = require('./template'),
    ncp = require('ncp').ncp,
    mdFilter = /[\/\\]([\w\-_\.=]+)\.(md|markdown|mdown|mkdn|mkd)$/,
    templates;

var META_FILE = 'meta.json',
    SITE_FILE = 'site.json',
    THEME_ROOT = '../src/themes';

// 整理 Array，删除其中的 undefined
function arrangeArray (array) {
    var item, i, l;
    if (!Array.isArray(array) || array.length === 0) {
        return [];
    }
    l = array.length;
    i = l - 1;

    while (i >= 0) {
        item = array[i];
        if (typeof item === 'undefined') {
            array.splice(i, 1);
        }
        i--;
    }
    return array;
}

// 获取文件夹信息，如果设置了轮询，返回的文件夹列表为空数组
function getDirectoryInfo (directory) {
    var stat = fs.lstatSync(directory),
        data = {},
        dirFiles;

    data.directorys = [];
    data.files = [];

    if (stat.isDirectory()) {
        dirFiles = fs.readdirSync(directory);
        dirFiles.forEach(function (file, i) {
            var filePath = path.join(directory, file),
                stat = fs.lstatSync(filePath);
            if (stat.isDirectory()) {
                data.directorys.push(file);
            } else {
                realPath = fs.realpathSync(filePath);
                if (mdFilter.test(realPath)) {
                    data.files.push(realPath);
                }
            }
        });
    } else {
        console.error(directory + ' is Not Directory.');
    }
    return data;
}


// 读取 Markdown 文件，并根据 H1 解析为段
function getSection (filePath) {
    var fileData = fs.readFileSync(filePath, 'utf8').split('\n'),
        line, match, lastLine, section, fileMatch, fileName,
        sectionId, sectionName, sectionData = [],
        fileNamePattern = /[\/\\]([\w\-_\.=]+)\.(md|markdown|mdown|mkdn|mkd)$/,
        setextStyleHeadingPattern = /^#\s+(.*)/,
        atxStyleHeadingPattern = /^(={3,})(\s*)$/,
        endWithWhitespaceattern = /(\s*)$/,
        startWithWhitespaceattern = /^(\s*)/,
        endWithSharpPattern = /(\s)*(#+)(\s)*$/;

    fileMatch = fileNamePattern.exec(filePath);
    if ((fileMatch || []).length > 2) {
        sectionId = fileMatch[1];
        fileName = sectionId + '.' + fileMatch[2];
    } else {
        return section;
    }

    while (fileData.length > 0) {
        line = fileData.shift();
        if (sectionName) {
            sectionData.push(line);
        } else {
            if (atxStyleHeadingPattern.test(line)) {
                if (lastLine && lastLine.length > 0) {
                    sectionName = lastLine.replace(startWithWhitespaceattern, '');
                    sectionName = sectionName.replace(endWithWhitespaceattern, '');
                } else {
                    lastLine = line;
                }
            } else {
                match = setextStyleHeadingPattern.exec(line);
                if ((match || []).length > 1) {
                    sectionName = match[1];
                    sectionName = sectionName.replace(endWithSharpPattern, '');
                } else {
                    lastLine = line;
                }
            }
        }
    }

    if (sectionName) {
        section = {
            id: sectionId,
            fileName: fileName,
            name: sectionName,
            data: converterToHtml(sectionData.join('\n'))
        };
    }

    return section;
}

function converterToHtml(text) {
    text = converter.makeHtml(text);
    // beautify Code
    text = text.replace(/<pre([^>\n]*)>/g, '<pre$1 class="prettyprint linenums">');
    // beautify Table
    text = text.replace(/<table([^>\n]*)>/g, '<table$1 class="table table-striped table-bordered">');
    return text;
}

function Metadocs (config) {
    config = config || {};
    this.config = {
        src: config.src || path.join(__dirname, '../src/docs'),
        dest: config.dest || path.join(__dirname, '../docs'),
        theme: config.theme || 'bootstrap'
    };
}

Metadocs.prototype.gen = function () {
    var that = this,
        cfg = this.config;

    this.site = {};
    this.root = {};
    this.globeData = {};

    this.themePath = path.join(__dirname, THEME_ROOT, cfg.theme);
    if (!existsSync(this.themePath)) {
        console.error('No Theme Founded.');
        return;
    }

    this.src = fs.realpathSync(cfg.src);
    if (!existsSync(this.src)) {
        console.error('src not Founded.');
        return;
    }

    if (!existsSync(cfg.dest)) {
        fs.mkdirSync(cfg.dest);
    }
    this.dest = fs.realpathSync(cfg.dest);

    this.site = this.getSiteInfo();
    this.root = this.getData({}, '');
    this.writeToDisk(this.root);
    if (existsSync(path.join(this.themePath, 'assets'))) {
        ncp(path.join(this.themePath, 'assets'), path.join(this.dest, 'assets'), function (){});
    }
};

Metadocs.prototype.getSiteInfo = function () {
    var siteConfig = path.join(this.src, SITE_FILE),
    siteInfo = this.getMetaInfo(siteConfig);
    return siteInfo;
};

// 获取模版
Metadocs.prototype.getTemplates = function () {
    var that = this;
    this.tplList = ['header', 'page', 'nav', 'main', 'footer'];
    if (this.templates) {
        return this.templates;
    }
    this.templates = {};
    this.tplList.forEach(function (t, i) {
        var filepath = path.join(that.themePath, t + '.html');
        if (existsSync(filepath)) {
            that.templates[t] = fs.readFileSync(filepath, 'utf8');
        }
    });
    return this.templates;
};

Metadocs.prototype.writeToDisk = function(current) {
    var that = this,
        directory = path.join(this.dest, current.id),
        templates = this.getTemplates(),
        data = {
            site: this.site,
            current: current,
            globe: this.globeData,
            root: this.root
        };
    if (!existsSync(directory)) {
        fs.mkdirSync(directory);
    }

    var headerHtml = tpl.tmpl(templates.header, data),
        navHtml = tpl.tmpl(templates.nav, data),
        mainHtml = tpl.tmpl(templates.main, data),
        footerHtml = tpl.tmpl(templates.footer, data),
        content = tpl.tmpl(templates.page, {
            header: headerHtml,
            nav: navHtml,
            main: mainHtml,
            footer: footerHtml
        });
    fs.writeFileSync(path.join(directory, 'index.html'), content, 'utf8');
    current.config.assets.forEach(function (a, i) {
        ncp(path.join(that.src, current.id, a), path.join(directory, a), function (){});
    });
    current.childrenId.forEach(function (cid, i) {
        var child = that.globeData[cid];
        that.writeToDisk(child);
    });
};

// 获取 meta 文件的信息
Metadocs.prototype.getMetaInfo = function (file) {
    var metaInfo;

    if (existsSync(file)) {
        try {
            metaInfo = require(fs.realpathSync(file));
        } catch (e) {
            console.error('Failed When Parse Metafile:' + file);
        }
    }
    return metaInfo;
};

// 获取数据
Metadocs.prototype.getData = function (parent, id) {
    var that = this,
        config = {
            name: '',
            description: [],
            order: [],
            assets: [],
            childrenOrder: [],
            showOnNav: true
        };

    var level = parent.level >= 0 ? parent.level + 1 : 0,
        rootDirectory = path.join(this.src, id),
        metaFile = path.join(rootDirectory, META_FILE);
    var metaInfo = this.getMetaInfo(metaFile) || {};
    for(p in metaInfo) {
        if (metaInfo.hasOwnProperty(p)) {
            config[p] = metaInfo[p];
        }
    }

    // 加载描述
    var tmpDescription = [], description,
        pattern = /([\w\-_\.=]+)\.(md|markdown|mdown|mkdn|mkd)$/;
    config.description.forEach(function (d, i) {
        var match = pattern.exec(d);
        if ((match || []).length > 2) {
            tmpDescription.push(match[1]);
        } else {
            tmpDescription.push(d);
        }
    });
    description = new Array(tmpDescription.length);

    var directoryInfo = getDirectoryInfo(rootDirectory),
        sectionFiles = [],
        fileNamePattern = /[\/\\]([\w\-_\.=]+)\.(md|markdown|mdown|mkdn|mkd)$/;
    directoryInfo.files.forEach(function (f, i) {
        var fileMatch = fileNamePattern.exec(f),
            index = -1;
        if ((fileMatch || []).length > 2) {
            index = tmpDescription.indexOf(fileMatch[1]);
        }

        if (index >= 0) {
            description[index] = {
                file: f,
                data: converterToHtml(fs.readFileSync(f, 'utf8'))
            };
        } else {
            sectionFiles.push(f);
        }
    });
    arrangeArray(description);

    var metaOrder = config.order,
        sectionsIndex = [],
        sections = new Array(metaOrder.length);
    sectionFiles.forEach(function (f, i) {
        var section = getSection(f);
        if (section) {
            var sectionId = section.id,
                fileName = section.fileName,
                sectionName = section.name,
                index = metaOrder.indexOf(sectionId);

            if (index < 0) {
                index = metaOrder.indexOf(fileName);
            }

            if (sectionsIndex.indexOf(sectionName) >= 0) {
                console.error('Duplicate Section Name:' + sectionName + ' Founded in file:' + f);
            } else {
                sectionsIndex.push(sectionName);
                if (index >= 0) {
                    sections[index] = section;
                } else {
                    sections.push(section);
                }
            }
        }
    });
    arrangeArray(sections);

    var metaAssets = config.assets,
        assets = [],
        metaChildrenOrder= config.childrenOrder,
        childrenId = new Array(metaChildrenOrder.length);
    directoryInfo.directorys.forEach(function (d, i) {
        var assetsIndex = metaAssets.indexOf(d),
            index = metaChildrenOrder.indexOf(d);
        if(assetsIndex >= 0) {
            assets.push(d);
        } else {
            d = id.length > 0? id + '/' + d : d;
            if (index >= 0) {
                childrenId[index] = d;
            } else {
                childrenId.push(d);
            }
        }
    });
    arrangeArray(childrenId);

    var data = {
        id: id,
        name: config.name || id,
        parentId: parent.id,
        childrenId: childrenId,
        description: description,
        sections: sections,
        assets: assets,
        config: config,
        level: level
    };

    this.globeData[id] = data;

    childrenId.forEach(function(cid, i) {
        that.getData(data, cid);
    });
    return data;
};

module.exports = Metadocs;