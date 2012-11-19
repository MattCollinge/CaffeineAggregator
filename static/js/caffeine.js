$(function() {
    $('.pos-action').click(function() {
        var button = $(this);
        button.addClass('disabled');
        $.post('/publish', {drink:button.attr('id')}, function() {
                button.removeClass('disabled');
        });
        return false;
    });
});