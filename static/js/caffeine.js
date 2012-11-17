$(function() {
    $('#coffee').click(function() {
        $.post('/publish');
        return false;
    });
});