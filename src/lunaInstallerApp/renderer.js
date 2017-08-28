var applications

function updateList(selectId) {
    var $this = $(selectId), numberOfOptions = $(selectId).children('option').length;

    var $styledSelect = $this.next('div.select-styled');
    $styledSelect.children(".select-options").remove()

    $styledSelect.text($this.children('option').eq(0).text());

    var $list = $('<ul />', {
        'class': 'select-options'
    }).insertAfter($styledSelect);

    for (var i = 0; i < numberOfOptions; i++) {
        $('<li />', {
            text: $this.children('option').eq(i).text(),
            rel: $this.children('option').eq(i).val()
        }).appendTo($list);
    }

    var $listItems = $list.children('li');

    // items list is recreated each time
    $listItems.click(function(e) {
        e.stopPropagation();
        $styledSelect.text($(this).text()).removeClass('active');
        $this.val($(this).attr('rel'));
        $list.hide();
        $this.selectedIndex=$this.val();
        if ($this.attr("id")==="application") {
            updateVersions()
        }
    });
}

function updateVersions() {
    selection = $("#application").val()
    if (applications) {
        $versionSelect = $("#version")
        $versionSelect.empty()
        $.each(applications[selection].versions, function(index, version) {
            var $option = $("<option></option>").attr("value", index).text(version)
            $versionSelect.append($option)
        })
        updateList("#version")
    }
}

ipcRenderer.on('packet-from-console', function(event, arg) {
    if (arg.initialize) {
        applications = arg.initialize.applications

        var $appSelect = $("#application")

        $appSelect.empty()
        $.each(applications, function(i, app) {
            var $option = $("<option></option>").attr("value", i).text(app.name)
            $appSelect.append($option)
        })
        updateList("#application")
        updateVersions()
        $("#loading").hide()
        $("#main_form").show()
    }
    var dashValue = parseFloat($("#progress-bar").css('stroke-dasharray'))

    if (arg.download_progress) {
        $("#spinner").addClass("rotating")
        $("#progress-bar").css('stroke-dashoffset', (dashValue - arg.download_progress/100 * dashValue))
        $("#progress-info").html("Downloading: <b>" + arg.download_progress + "%</b>")
    }
    if (arg.installation_progress) {
        $("#spinner").addClass("rotating")
        $("#progress-bar").css('stroke-dashoffset', (dashValue - arg.installation_progress/100 * dashValue))
        $("#progress-info").html("Installing: <b>" + arg.installation_progress + "%</b>")
    }
    if (arg.installation_progress === 100) {
        $("#spinner").removeClass("rotating")
        $("#logo-area").css('background-image', 'url(img/luna_logo.svg)')
        $("#spinner").hide()
    }
})

$("#application").change(updateVersions)


$('div.select-styled').click(function(e) {
    e.stopPropagation();
    $('div.select-styled.active').not(this).each(function(){
        console.log("hiding", $(this).attr('id'))
        $(this).removeClass('active').next('ul.select-options').hide();
    });
    console.log("toggling", $(this).attr('id'))
    $(this).toggleClass('active').next('ul.select-options').toggle();
})

$(document).click(function() {
    $('div.select-styled.active').each(function() {
        $(this).removeClass('active').next('ul.select-options').hide()
    })
})

$("#install").click(function() {
    $("#logo-area").css('background-image', 'url(img/luna_logo_without_border.svg)')
    $("#spinner").show()

    var install = {
        "install": {
            "application": $("#application option:selected").text(),
            "version": $("#version option:selected").text()
        }
    }
    ipcRenderer.send("packet-to-console", install)
})

ipcRenderer.send('ready')