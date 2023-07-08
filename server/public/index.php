<?php

use League\CommonMark\Environment;
use League\CommonMark\Extension\Autolink\AutolinkExtension;
use League\CommonMark\Extension\CommonMarkCoreExtension;
use League\CommonMark\MarkdownConverter;

require_once __DIR__ . '/../bootstrap.php';

// Configure the Environment with all the CommonMark parsers/renderers
$environment = new Environment([]);
$environment->addExtension(new CommonMarkCoreExtension());

// Add this extension
$environment->addExtension(new AutolinkExtension());

// Instantiate the converter engine and start converting some Markdown!
$converter = new MarkdownConverter($environment);

$readmeFile = file_get_contents(ROOT_ABSOLUTE_PATH . '/README.md');

//symlink for readme images
@symlink(realpath(ROOT_ABSOLUTE_PATH.'/assets/images'),realpath(DOCUMENT_ROOT.'/assets/images'));
?>


<html lang="fr">
<head>
    <title>Smart Download Helper</title>
    <link rel="stylesheet" type="text/css" href="markdown.css">
    <link rel="icon" sizes="16x16" href="/assets/images/icon-16.png">
</head>
<body>
<?php echo $converter->convertToHtml($readmeFile); ?>
</body>
</html>
