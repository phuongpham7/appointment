package Database;

use DBI;
use JSON;
sub new
{
    my $class = shift;
    my $self = {
        _deriver => shift,
        _db => shift,
        _user  => shift,
        _password       => shift,
        _dbh => shift,
    };
    $self->{_dbh} = DBI->connect(          
    'DBI:'.$self->{_deriver}.":db=".$self->{_db}, 
    $self->{_user},
    $self->{_password},
    { RaiseError => 1}
    ) or die $DBI::errstr;
    $self->{_dbh}->do("CREATE TABLE IF NOT Exists appointments(Id INTEGER PRIMARY KEY AutoIncrement, Date DateTime, Description TEXT)");
    
    bless $self, $class;
    return $self;
}
sub DESTROY
{
    $self->{_dbh}->disconnect();
}
