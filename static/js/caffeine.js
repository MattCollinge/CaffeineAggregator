$(function() {
    $('.pos-action').click(function() {
        var button = $(this);
        button.addClass('disabled');
        $.post('/publish', {drink:button.attr('id')}, function() {
            setTimeout(function() {
                button.removeClass('disabled');
            }, 1000);
        });
        return false;
    });
});