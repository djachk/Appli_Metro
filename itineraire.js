

function element_priorite(dedans,distance) {
	this.dedans=dedans;
  this.distance=distance;
}


var stations=[];
var nbstations=383;
var poids=new Array();
var succ=new Array();

var Pi=new Array();
var d=new Array();
var File_Priorite=new Array();
var long_File=nbstations;

//pour obtenir le numero de statsion a partir de son nom
function numero_station(st) {
  for (var i=0; i<nbstations;i++) {
    if (stations[i]==st) {return i;}
   } 
 return null;
}

//pour Dijkstra
function Construire_File_Priorite() {
  long_File=nbstations;
  for (var i=0; i<nbstations;i++) {
  File_Priorite[i]= new element_priorite(true,Infinity);
  }
}
 
//pour Dijkstra 
function Extraire_Min (){
  var min=Infinity;
  var ind=0;
  for (var i=0; i<nbstations;i++) {
    if (File_Priorite[i].dedans && File_Priorite[i].distance<min) {
      min=File_Priorite[i].distance;
      ind=i;
    }
   } 
   long_File--;
   File_Priorite[ind].dedans=false;
   return ind;
}

//pour Dijkstra
function Maj_File(v) {
  File_Priorite[v].distance=d[v];
}

//algo Dijkstra
function Dijkstra (s1,s2,Pi,d) {
  Construire_File_Priorite();
  for (var i=0; i<nbstations;i++) {
    Pi[i]=null;
    if (i==s1) 
      {d[i]=0;
        File_Priorite[i].distance=0;}
    else 
      {d[i]=Infinity;
        File_Priorite[i].distance=Infinity;}
  }
  while (long_File != 0) {
    var u=Extraire_Min();
    for (var i=0; i<succ[u].length;i++) {
      var v=succ[u][i];
      if (d[v]>d[u]+poids[u][v]) {
        d[v]=d[u]+poids[u][v];
        Pi[v]=u;
        Maj_File(v);
        if (v==s2) {return;}
      }
    }
  }
}

var fs=require('fs');

//lecture des stations
fs.readFile('metro_graphe.labels', function(erreur,data) {
   if (erreur) throw erreur;
   var lignes=data.toString('utf8').split("\n");
   var l=lignes.length;
   for(var i=0; i<l; i++) {
     	/(^[0-9]*) (.*)/.exec(lignes[i]);
     	var num=parseInt(RegExp.$1,10);
     	stations[num]=RegExp.$2;
   }
   nbstations=stations.length;
})

//lecture des arcs. Pour chaque sommet, on note ses successeurs
fs.readFile('metro_graphe.edges', function(erreur,data) {
   if (erreur) throw erreur;
   for(var i=0; i<nbstations; i++) {
      succ[i] = new Array();
      poids[i]=new Array();
    }
   var lignes=data.toString('utf8').split("\n");
   var l=lignes.length;
   for(var i=0; i<l-1; i++) {
   		var st=lignes[i].split(" ");
   		var d=parseInt(st[0],10);
        var a=parseInt(st[1],10);
        var p=parseInt(st[2],10);
 
        succ[d].push(a);
        poids[d][a]=p;
   }
})


num_ligne=new Array();
station_depart={};
station_arrivee={};
stations_ligne={};

//pour lire les lignes, en notant le debut et la fin de la ligne 
function lire_fichier_ligne(fichier_ligne,ligne_lue) {
	stations_ligne[ligne_lue]=new Array();
  fs.readFile(fichier_ligne, function(erreur,data) {
     if (erreur) throw erreur;
    var lignes=data.toString('utf8').split("\n");
    var l=lignes.length;
    for(var i=0; i<l-1; i++) {
       //var st=lignes[i].split(" ");
       var station=parseInt(lignes[i],10);
       num_ligne[station]=ligne_lue;
       stations_ligne[ligne_lue].push(station);
       if (i==0) station_depart[ligne_lue]=station;
       if (i==l-2) station_arrivee[ligne_lue]=station;
    }
} )
}

//pour calculer la direction d'un troncon
function direction(station1,station2) {
	var nligne=num_ligne[station1];
	var st_depart=station_depart[nligne];
	var st_arrivee=station_arrivee[nligne];
	for (var i=0; i<stations_ligne[nligne].length;i++) {
		if (stations_ligne[nligne][i]==station1) {
			return st_arrivee;};
		if (stations_ligne[nligne][i]==station2) {
			return st_depart;};
	}
	
}

 function troncon(station1,station2,num_ligne,changer,direction) {
  this.station1=station1;
  this.station2=station2;
  this.num_ligne=num_ligne;
  this.changer=changer;
  this.direction=direction;
}

//pour construire le trajet a partir du resulat de Dijkstra
function construire_trajet(depart,arrivee){
var Trajet=new Array();
var station1=Pi[arrivee];
  var station2=arrivee;
  var Suivant=new Array();
  while (true) {
    Suivant[station1]=station2;
    station2=station1;
    if (station2==depart) {break;}
    station1=Pi[station1];
   }
  station1=depart;
  station2=Suivant[depart];
  var num_troncon=0;

  while (true) {
    var changer, nligne,dir;
    if (poids[station1][station2]==2) {changer=true;} else {changer=false;}
    nligne=num_ligne[station2];
    dir=direction(station2,Suivant[station2]);
    Trajet[num_troncon]=new troncon(stations[station1],stations[station2],nligne,changer,stations[dir]);
    num_troncon++;
    station1=station2;
    if (station1==arrivee) {break;}
    station2=Suivant[station2];
  }
  return Trajet;
}

//lesture des lignes
lire_fichier_ligne("metro_ligne1.stations",1);
lire_fichier_ligne("metro_ligne2.stations",2);
lire_fichier_ligne("metro_ligne3.stations",3);
lire_fichier_ligne("metro_ligne3b.stations","3b");
lire_fichier_ligne("metro_ligne4.stations",4);
lire_fichier_ligne("metro_ligne5.stations",5);
lire_fichier_ligne("metro_ligne6.stations",6);
lire_fichier_ligne("metro_ligne7.stations",7);
lire_fichier_ligne("metro_ligne7b.stations","7b");
lire_fichier_ligne("metro_ligne8.stations",8);
lire_fichier_ligne("metro_ligne9.stations",9);
lire_fichier_ligne("metro_ligne10.stations",10);
lire_fichier_ligne("metro_ligne11.stations",11);
lire_fichier_ligne("metro_ligne12.stations",12);
lire_fichier_ligne("metro_ligne13.stations",13);
lire_fichier_ligne("metro_ligne14.stations",14);

var express=require('express');
var serv=express(); 
serv.set('view engine','ejs');

var bodyParser=require('body-parser');
serv.use(bodyParser.json());

//service de la page principale
serv.get('/',function(req,res) {
        res.render('metro.ejs');
   })

//service du calcul de l itineraire
serv.get('/calculer',function(req,res) {
    var nom_depart=req.query.dep;
    var nom_arrivee=req.query.arr;
    var depart=numero_station(nom_depart);
    var arrivee=numero_station(nom_arrivee); 
    var Trajet=[]; 
    if (depart && arrivee) {

        Dijkstra(depart,arrivee,Pi,d);
        Trajet=construire_trajet(depart,arrivee);

        res.send(Trajet).status(204);
    }
    else {
        res.send(Trajet).status(404); 
    }
  })   

//service des noms de stations pour l autocompletion
serv.get('/nomstations',function(req,res) {
          res.send(stations).status(204);

  })   

serv.use(express.static('AutoComplete'));
serv.listen(8080);
console.log("Lancement du serveur, en écoute sur le port 8080");

