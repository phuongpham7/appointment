#!"C:\xampp\perl\bin\perl.exe"
BEGIN {
    push @INC, "data";
}

use strict;
use CGI qw(:standard);
use CGI;
use Database;
use JSON;
my $driver = "SQLite";
my $dbname = "data/appointments.db";
my $user = "";
my $password = "";
my $db = new Database($driver,$dbname,$user,$password);

# curl curl http://localhost:8090/defn/stun?token=ABC123

get '/appt/:appt' => sub {
    my $self = shift;
    my $appt = $self -> stash('appt');

    my $sql = 'SELECT Id, Date, Description FROM appointments where description like '?' order by Date';
    my $sth = $self -> db -> prepare($sql);
    $sth -> execute ('%'.$appt.'%');
    my $res = $sth->fetchall_arrayref;
    $sth->finish;
    $self->db_disconnect;

    if (@$res)
    {
        return $self -> render(json => { res => $res });
    }
    else
    {
        return $self -> render(json => { result => 0, message => 'No such result' });
    }
};

# curl --data 'token=ABC123&json={"description":"XXX","date":"xyz"}' http://localhost:8090/add
post '/add/' => sub {
    my $self = shift;
    my $date = data.date;
    my $description = data.description;
    my $sql = 'INSERT INTO appointments (date, description) VALUES (?, ?, ?)';
    my $sth = $self->db->prepare($sql);
    $sth->execute( $date, $description );
    my $new_id = $sth->{sqlite_insertid};
    $sth->finish;
    $self->db_disconnect;

    if ( $new_id )
    {
        return $self->render( json => { result => 1, message => 'OK' } );
    }
    else {
        return $self->render( json => { result => 0, message => 'Insert Failure' } );
    }
};

# curl -X DELETE http://localhost:8090/delete/42?token=ABC123
del '/delete/:id' => sub {
    my $self = shift;

    my $id = $self->stash('id');

    my $sql = 'DELETE FROM appointments WHERE Id=?';
    my $sth = $self->db->prepare($sql);
    my $rv = $sth->execute($id);
    $sth->finish;
    $self->db_disconnect;

    if ( $rv && $rv ne '0E0' )
    {
        return $self->render( json => { result => 1, message => 'OK' } );
    }
    else {
        return $self->render( json => { result => 0, message => 'Delete Failure' } );
    }
};

helper db_disconnect => sub {
   my $self = shift;
   $self->db->disconnect;
   $db = "";
};
